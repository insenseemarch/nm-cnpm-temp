import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Events
 *   description: Sự kiện của gia đình
 */

/**
 * @swagger
 * /api/families/{familyId}/events:
 *   get:
 *     summary: Lấy danh sách sự kiện của gia đình
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu (yyyy-MM-dd)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc (yyyy-MM-dd)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Loại sự kiện (birthday, memorial, wedding, meeting, other)
 *     responses:
 *       200:
 *         description: Danh sách sự kiện
 */
router.get('/:familyId/events', authenticateToken, (req, res) =>
  eventController.list(req, res),
);

/**
 * @swagger
 * /api/families/{familyId}/events:
 *   post:
 *     summary: Tạo sự kiện mới cho gia đình
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - date
 *               - time
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 description: Loại sự kiện (birthday, memorial, wedding, meeting, other)
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *                 example: "15:00"
 *               reminderDays:
 *                 type: integer
 *                 description: Số ngày nhắc trước (0 = không nhắc)
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo sự kiện thành công
 */
router.post('/:familyId/events', authenticateToken, (req, res) =>
  eventController.create(req, res),
);

/**
 * @swagger
 * /api/families/{familyId}/events/{eventId}:
 *   get:
 *     summary: Lấy chi tiết một sự kiện
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết sự kiện
 *       404:
 *         description: Không tìm thấy sự kiện
 */
router.get('/:familyId/events/:eventId', authenticateToken, (req, res) =>
  eventController.getById(req, res),
);

/**
 * @swagger
 * /api/families/{familyId}/events/{eventId}:
 *   patch:
 *     summary: Cập nhật sự kiện (chỉ người tạo)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               time:
 *                 type: string
 *               reminderDays:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật sự kiện thành công
 */
router.patch('/:familyId/events/:eventId', authenticateToken, (req, res) =>
  eventController.update(req, res),
);

/**
 * @swagger
 * /api/families/{familyId}/events/{eventId}:
 *   delete:
 *     summary: Xóa sự kiện (người tạo hoặc admin)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: familyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa sự kiện thành công
 *       403:
 *         description: Không có quyền xóa
 *       404:
 *         description: Không tìm thấy sự kiện
 */
router.delete('/:familyId/events/:eventId', authenticateToken, (req, res) =>
  eventController.delete(req, res),
);

export default router;
