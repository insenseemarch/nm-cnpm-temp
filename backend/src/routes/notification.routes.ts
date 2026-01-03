import { Router } from "express";
import notificationController from "../controllers/notification.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticateToken, notificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get(
  "/unread-count",
  authenticateToken,
  notificationController.getUnreadCount
);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.post(
  "/mark-all-read",
  authenticateToken,
  notificationController.markAllAsRead
);

/**
 * @swagger
 * /api/notifications/{id}/mark-read:
 *   post:
 *     summary: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.post(
  "/:id/mark-read",
  authenticateToken,
  notificationController.markAsRead
);

/**
 * @swagger
 * /api/notifications/trigger-reminders:
 *   post:
 *     summary: Manually trigger scheduled reminders (birthday, anniversary, event)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reminders triggered successfully
 */
router.post(
  "/trigger-reminders",
  authenticateToken,
  notificationController.triggerScheduledReminders
);

export default router;
