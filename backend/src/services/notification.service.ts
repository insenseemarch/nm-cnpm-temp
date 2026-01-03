import prisma from "../utils/prisma";
import { NotificationType } from "@prisma/client";
import { getSocketService } from "./socket.service";

// Notification data interface
interface CreateNotificationData {
  userId: string;
  senderId?: string;
  familyId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  scheduledFor?: Date;
}

export class NotificationService {
  // ============ CREATE NOTIFICATIONS ============

  /**
   * Create a single notification
   */
  async createNotification(data: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        senderId: data.senderId || null,
        familyId: data.familyId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
        scheduledFor: data.scheduledFor || null,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format notification for frontend
    const formattedNotification = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      read: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      actorName: notification.sender?.name,
      familyId: notification.familyId,
      familyName: notification.family?.name,
      refId: (notification.data as any)?.refId,
      personName: (notification.data as any)?.personName,
    };

    // Emit real-time notification
    try {
      const socketService = getSocketService();
      socketService.notifyUser(notification.userId, formattedNotification);
    } catch (error) {
      // Socket service not available, skip real-time notification
    }

    return notification;
  }

  /**
   * Create multiple notifications at once (for sending to multiple users)
   */
  async createBulkNotifications(notifications: CreateNotificationData[]) {
    const result = await prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        senderId: n.senderId || null,
        familyId: n.familyId || null,
        type: n.type,
        title: n.title,
        message: n.message,
        data: n.data || {},
        scheduledFor: n.scheduledFor || null,
        isRead: false,
      })),
    });

    // For bulk notifications, also emit real-time to each user
    try {
      const socketService = getSocketService();
      
      // Get created notifications to emit
      for (const notifData of notifications) {
        const formattedNotification = {
          id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID for real-time
          type: notifData.type,
          title: notifData.title,
          message: notifData.message,
          data: notifData.data,
          read: false,
          createdAt: new Date().toISOString(),
          actorName: notifData.senderId ? "Unknown" : undefined, // Will be resolved on refresh
          familyId: notifData.familyId,
          familyName: undefined, // Will be resolved on refresh
          refId: (notifData.data as any)?.refId,
          personName: (notifData.data as any)?.personName,
        };

        socketService.notifyUser(notifData.userId, formattedNotification);
      }
    } catch (error) {
      // Socket service not available, skip real-time notifications
    }

    return result;
  }

  /**
   * Notify family admin(s) - helper method
   */
  async notifyFamilyAdmin(
    familyId: string,
    senderId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ) {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) return null;

    return await this.createNotification({
      userId: family.adminId,
      senderId,
      familyId,
      type,
      title,
      message,
      data: data || {},
    });
  }

  /**
   * Notify all family members (except sender)
   */
  async notifyFamilyMembers(
    familyId: string,
    senderId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    excludeUserIds: string[] = []
  ) {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: {
        users: { select: { id: true } },
        adminId: true,
      },
    });

    if (!family) return null;

    // Get all user IDs in family, exclude sender and specified users
    const allExcluded = [senderId, ...excludeUserIds];
    const userIds = family.users
      .map((u) => u.id)
      .filter((id) => !allExcluded.includes(id));

    // Also include admin if not excluded
    if (!allExcluded.includes(family.adminId)) {
      if (!userIds.includes(family.adminId)) {
        userIds.push(family.adminId);
      }
    }

    if (userIds.length === 0) return null;

    const notifications: CreateNotificationData[] = userIds.map((userId) => ({
      userId,
      senderId,
      familyId,
      type,
      title,
      message,
      data: data || {},
    }));

    return await this.createBulkNotifications(notifications);
  }

  // ============ READ NOTIFICATIONS ============

  // Get all notifications for a user from families they belong to
  async getUserNotifications(userId: string) {
    // First get all families where user is admin or member
    const userFamilies = await prisma.family.findMany({
      where: {
        OR: [
          { adminId: userId },
          { users: { some: { id: userId } } }
        ]
      },
      select: { id: true, name: true }
    });

    const familyIds = userFamilies.map(f => f.id);

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId, // Make sure this filter is applied!
        OR: [
          { familyId: null }, // System notifications
          { familyId: { in: familyIds } } // Family notifications from user's families
        ]
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        family: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return notifications.map((n: any) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data,
      read: n.isRead,
      createdAt: n.createdAt.toISOString(),
      actorName: n.sender?.name,
      familyId: n.familyId,
      familyName: n.family?.name,
      refId: (n.data as any)?.refId,
      personName: (n.data as any)?.personName,
    }));
  }

  // Mark a notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    return await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // Mark all notifications as read for user's families
  async markAllAsRead(userId: string) {
    // First get all families where user is admin or member
    const userFamilies = await prisma.family.findMany({
      where: {
        OR: [
          { adminId: userId },
          { users: { some: { id: userId } } }
        ]
      },
      select: { id: true }
    });

    const familyIds = userFamilies.map(f => f.id);

    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        OR: [
          { familyId: null }, // System notifications
          { familyId: { in: familyIds } } // Family notifications from user's families
        ]
      },
      data: { isRead: true },
    });
  }

  // Get unread count from families user belongs to
  async getUnreadCount(userId: string) {
    // First get all families where user is admin or member
    const userFamilies = await prisma.family.findMany({
      where: {
        OR: [
          { adminId: userId },
          { users: { some: { id: userId } } }
        ]
      },
      select: { id: true }
    });

    const familyIds = userFamilies.map(f => f.id);

    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        OR: [
          { familyId: null }, // System notifications
          { familyId: { in: familyIds } } // Family notifications from user's families
        ]
      },
    });
  }
}

export default new NotificationService();
