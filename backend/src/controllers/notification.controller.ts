import { Request, Response } from "express";
import notificationService from "../services/notification.service";
import schedulerService from "../services/scheduler.service";

export class NotificationController {
  // Get all notifications for the authenticated user
  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const notifications = await notificationService.getUserNotifications(
        userId
      );

      res.json(notifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Mark a notification as read
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Notification ID is required" });
      }

      const notification = await notificationService.markAsRead(id, userId);

      return res.json({ message: "Notification marked as read", notification });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      return res
        .status(error.message === "Notification not found" ? 404 : 500)
        .json({ error: error.message });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      await notificationService.markAllAsRead(userId);

      res.json({ message: "All notifications marked as read" });
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get unread count
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const count = await notificationService.getUnreadCount(userId);

      res.json({ count });
    } catch (error: any) {
      console.error("Error getting unread count:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Manually trigger scheduled reminders (for testing/admin)
  async triggerScheduledReminders(_req: Request, res: Response) {
    try {
      console.log("📅 Manual trigger of scheduled reminders requested");

      await schedulerService.runDailyTasks();

      res.json({
        message: "Scheduled reminders triggered successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Error triggering scheduled reminders:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new NotificationController();
