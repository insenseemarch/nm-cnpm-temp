import { Router } from 'express';
import { ConfessionController } from '../controllers/confession.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const controller = new ConfessionController();

/**
 * @swagger
 * tags:
 *   name: Confessions
 *   description: Tâm sự trong gia đình
 */

/**
 * @swagger
 * /api/families/{id}/confessions:
 *   post:
 *     summary: Tạo tâm sự mới
 *     tags: [Confessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - isAnonymous
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Hôm nay mình muốn chia sẻ..."
 *               isAnonymous:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tạo tâm sự thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không được phép
 *       403:
 *         description: Không phải thành viên gia đình
 *       429:
 *         description: Vượt quá giới hạn 3 tâm sự/ngày
 */
router.post('/:id/confessions', authenticateToken, (req, res) =>
  controller.create(req, res),
);

/**
 * @swagger
 * /api/families/{id}/confessions:
 *   get:
 *     summary: Lấy danh sách tâm sự của gia đình
 *     tags: [Confessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: display
 *         schema:
 *           type: string
 *           enum: [all, anonymous, public]
 *         description: Lọc theo loại (tất cả / ẩn danh / công khai)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [desc, asc]
 *         description: Sắp xếp theo thời gian (mới nhất/cũ nhất)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách tâm sự
 *       401:
 *         description: Không được phép
 *       403:
 *         description: Không phải thành viên gia đình
 */
router.get('/:id/confessions', authenticateToken, (req, res) =>
  controller.list(req, res),
);

/**
 * @swagger
 * /api/families/{id}/confessions/{confessionId}:
 *   get:
 *     summary: Lấy chi tiết một tâm sự
 *     tags: [Confessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: confessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết tâm sự
 *       401:
 *         description: Không được phép
 *       403:
 *         description: Không phải thành viên gia đình
 *       404:
 *         description: Không tìm thấy tâm sự
 */
router.get('/:id/confessions/:confessionId', authenticateToken, (req, res) =>
  controller.getById(req, res),
);

/**
 * @swagger
 * /api/families/{id}/confessions/{confessionId}:
 *   patch:
 *     summary: Chỉnh sửa tâm sự (tác giả)
 *     tags: [Confessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: confessionId
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
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Nội dung tâm sự mới
 *               isAnonymous:
 *                 type: boolean
 *                 description: Cập nhật trạng thái ẩn danh
 *     responses:
 *       200:
 *         description: Cập nhật tâm sự thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không được phép
 *       403:
 *         description: Chỉ tác giả mới được sửa
 *       404:
 *         description: Không tìm thấy tâm sự
 */
router.patch('/:id/confessions/:confessionId', authenticateToken, (req, res) =>
  controller.update(req, res),
);

/**
 * @swagger
 * /api/families/{id}/confessions/{confessionId}:
 *   delete:
 *     summary: Xóa tâm sự (admin)
 *     tags: [Confessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *       - in: path
 *         name: confessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Confession ID
 *     responses:
 *       200:
 *         description: Xóa tâm sự thành công
 *       401:
 *         description: Không được phép
 *       403:
 *         description: Chỉ admin mới được xóa
 *       404:
 *         description: Không tìm thấy tâm sự
 */
router.delete('/:id/confessions/:confessionId', authenticateToken, (req, res) =>
  controller.delete(req, res),
);

export default router;
