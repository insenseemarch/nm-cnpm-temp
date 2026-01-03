import { Router } from 'express';
import { FamilyController } from '../controllers/family.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const familyController = new FamilyController();

/**
 * @swagger
 * tags:
 *   name: Families
 *   description: Family management endpoints
 */

/**
 * @swagger
 * /api/families:
 *   post:
 *     summary: Create a new family
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyễn"
 *               description:
 *                 type: string
 *                 example: "Gia đình họ Nguyễn"
 *     responses:
 *       201:
 *         description: Family created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "1234"
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     adminId:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, (req, res) => familyController.createFamily(req, res));

/**
 * @swagger
 * /api/families:
 *   get:
 *     summary: Get all families where user is admin or member
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of families
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       admin:
 *                         type: object
 *                       _count:
 *                         type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, (req, res) => familyController.getUserFamilies(req, res));

/**
 * @swagger
 * /api/families/{id}:
 *   get:
 *     summary: Get family details by ID
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID (4-digit code)
 *         example: "1234"
 *     responses:
 *       200:
 *         description: Family details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Family not found
 */
router.get('/:id', authenticateToken, (req, res) => familyController.getFamilyById(req, res));

/**
 * @swagger
 * /api/families/{id}:
 *   put:
 *     summary: Update family information (admin only)
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *         example: "1234"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyễn Văn"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Family updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can update
 *       404:
 *         description: Family not found
 */
router.put('/:id', authenticateToken, (req, res) => familyController.updateFamily(req, res));

/**
 * @swagger
 * /api/families/{id}:
 *   delete:
 *     summary: Delete family (admin only)
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *         example: "1234"
 *     responses:
 *       200:
 *         description: Family deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can delete
 *       404:
 *         description: Family not found
 */
router.delete('/:id', authenticateToken, (req, res) => familyController.deleteFamily(req, res));

/**
 * @swagger
 * /api/families/{id}/join:
 *   post:
 *     summary: Request to join a family
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *         example: "1234"
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Tôi là con trai của Nguyễn Văn A"
 *     responses:
 *       201:
 *         description: Join request created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found
 *       409:
 *         description: Already member or pending request exists
 */
router.post('/:id/join', authenticateToken, (req, res) => familyController.createJoinRequest(req, res));

/**
 * @swagger
 * /api/families/{id}/join-requests:
 *   get:
 *     summary: Get all join requests for a family (admin only)
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *         example: "1234"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of join requests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can view
 *       404:
 *         description: Family not found
 */
router.get('/:id/join-requests', authenticateToken, (req, res) => familyController.getJoinRequests(req, res));

/**
 * @swagger
 * /api/families/{id}/join-requests/{requestId}:
 *   put:
 *     summary: Approve or reject join request (admin only)
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *         example: "1234"
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Join request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [APPROVE, REJECT]
 *                 example: "APPROVE"
 *     responses:
 *       200:
 *         description: Request processed successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can approve/reject
 *       404:
 *         description: Family or request not found
 *       409:
 *         description: Request already processed
 */
router.put('/:id/join-requests/:requestId', authenticateToken, (req, res) => familyController.handleJoinRequest(req, res));

/**
 * @swagger
 * /api/families/{id}/join-requests/{requestId}/suggestions:
 *   get:
 *     summary: Get link suggestions for join request (Phase 2 - Smart Linking)
 *     tags: [Families]
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
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Join request ID
 *     responses:
 *       200:
 *         description: Link suggestions with auto-match and possible matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                     autoMatch:
 *                       type: object
 *                       properties:
 *                         found:
 *                           type: boolean
 *                         member:
 *                           type: object
 *                     possibleMatches:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can view suggestions
 *       404:
 *         description: Family or request not found
 */
router.get('/:id/join-requests/:requestId/suggestions', authenticateToken, (req, res) => familyController.getJoinRequestSuggestions(req, res));

/**
 * @swagger
 * /api/families/{id}/join-requests/{requestId}/approve:
 *   put:
 *     summary: Approve join request with linking option (Phase 2 - Smart Linking)
 *     tags: [Families]
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
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Join request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [APPROVE, REJECT]
 *                 example: "APPROVE"
 *               linkOption:
 *                 type: string
 *                 enum: [AUTO, MANUAL, NEW]
 *                 description: AUTO = auto-match by email, MANUAL = admin selects member, NEW = join without linking
 *                 example: "AUTO"
 *               memberId:
 *                 type: string
 *                 description: Required if linkOption is MANUAL
 *                 example: "member_id_123"
 *     responses:
 *       200:
 *         description: Request processed successfully with linking info
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can approve/reject
 *       404:
 *         description: Family or request not found
 *       409:
 *         description: Request already processed
 */
router.put('/:id/join-requests/:requestId/approve', authenticateToken, (req, res) => familyController.approveJoinRequestWithLink(req, res));

/**
 * @swagger
 * /api/families/{id}/leave:
 *   post:
 *     summary: Leave family (unlink member node, remove from users)
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *     responses:
 *       200:
 *         description: Left family successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 unlinkedMember:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin must transfer admin role before leaving
 *       404:
 *         description: Not a member of this family
 */
router.post('/:id/leave', authenticateToken, (req, res) => familyController.leaveFamily(req, res));

/**
 * @swagger
 * /api/families/{id}/transfer-admin:
 *   post:
 *     summary: Transfer admin role to another user (admin only)
 *     tags: [Families]
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
 *               - newAdminId
 *             properties:
 *               newAdminId:
 *                 type: string
 *                 description: User ID of the new admin
 *                 example: "user_id_123"
 *     responses:
 *       200:
 *         description: Admin role transferred successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can transfer or new admin must be a member
 *       404:
 *         description: Family not found
 */
router.post('/:id/transfer-admin', authenticateToken, (req, res) => familyController.transferAdmin(req, res));

/**
 * @swagger
 * /api/families/{id}/statistics:
 *   get:
 *     summary: Get family statistics (births, marriages, deaths by year)
 *     tags: [Families]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *         example: "1234"
 *       - in: query
 *         name: fromYear
 *         schema:
 *           type: integer
 *         description: Start year (inclusive)
 *         example: 1950
 *       - in: query
 *         name: toYear
 *         schema:
 *           type: integer
 *         description: End year (inclusive)
 *         example: 2024
 *     responses:
 *       200:
 *         description: Family statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     yearlyStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: integer
 *                             example: 1950
 *                           births:
 *                             type: integer
 *                             example: 2
 *                           marriages:
 *                             type: integer
 *                             example: 1
 *                           deaths:
 *                             type: integer
 *                             example: 0
 *                     totalYearsWithEvents:
 *                       type: integer
 *                       example: 15
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalBirths:
 *                           type: integer
 *                           example: 25
 *                         totalMarriages:
 *                           type: integer
 *                           example: 18
 *                         totalDeaths:
 *                           type: integer
 *                           example: 5
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found or access denied
 */
router.get('/:id/statistics', authenticateToken, (req, res) => familyController.getStatistics(req, res));

export default router;
