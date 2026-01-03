import { Router } from 'express';
import { MemberRequestController } from '../controllers/member-request.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const memberRequestController = new MemberRequestController();

/**
 * @swagger
 * tags:
 *   name: Member Requests
 *   description: Member request management endpoints (ADD/EDIT/DELETE members with admin approval)
 */

/**
 * @swagger
 * /api/families/{id}/member-requests:
 *   post:
 *     summary: Create a member request (ADD/EDIT/DELETE)
 *     tags: [Member Requests]
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
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ADD_MEMBER, EDIT_MEMBER, DELETE_MEMBER]
 *                 example: "ADD_MEMBER"
 *               memberData:
 *                 type: object
 *                 description: Full member data (required for ADD/EDIT)
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Nguyễn Văn A"
 *                   gender:
 *                     type: string
 *                     enum: [MALE, FEMALE, OTHER]
 *                     example: "MALE"
 *                   generation:
 *                     type: integer
 *                     example: 1
 *                   childOrder:
 *                     type: integer
 *                     description: Birth order among siblings (con thứ mấy)
 *                     example: 2
 *                   email:
 *                     type: string
 *                     example: "a@example.com"
 *                   birthDate:
 *                     type: string
 *                     format: date
 *                     example: "1950-01-01"
 *                   occupation:
 *                     type: string
 *                     example: "Giáo viên"
 *                   customOccupation:
 *                     type: string
 *                     example: "Custom occupation"
 *                   hometown:
 *                     type: string
 *                     example: "Hà Nội"
 *                   currentAddress:
 *                     type: string
 *                     example: "123 ABC Street"
 *                   maritalStatus:
 *                     type: string
 *                     enum: [SINGLE, MARRIED, DIVORCED]
 *                     example: "MARRIED"
 *                   marriageDate:
 *                     type: string
 *                     format: date
 *                     example: "2020-05-15"
 *                   avatar:
 *                     type: string
 *                     example: "https://example.com/avatar.jpg"
 *                   bio:
 *                     type: string
 *                     example: "Member biography"
 *                   fatherId:
 *                     type: string
 *                     description: ID of father member
 *                     example: "father_member_id"
 *                   motherId:
 *                     type: string
 *                     description: ID of mother member
 *                     example: "mother_member_id"
 *                   spouseId:
 *                     type: string
 *                     description: ID of spouse member
 *                     example: "spouse_member_id"
 *                   isMe:
 *                     type: boolean
 *                     description: Set to true to auto-link this member to requester's account (only for ADD_MEMBER)
 *                     example: false
 *               targetMemberId:
 *                 type: string
 *                 description: Required for EDIT/DELETE
 *                 example: "member_id_123"
 *               message:
 *                 type: string
 *                 description: Optional reason/message
 *                 example: "Adding my grandfather"
 *     responses:
 *       201:
 *         description: Member request created successfully
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found or not a member
 */
router.post('/:id/member-requests', authenticateToken, (req, res) => memberRequestController.createMemberRequest(req, res));

/**
 * @swagger
 * /api/families/{id}/member-requests:
 *   get:
 *     summary: Get all member requests for a family (admin only)
 *     tags: [Member Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Family ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of member requests
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can view
 *       404:
 *         description: Family not found
 */
router.get('/:id/member-requests', authenticateToken, (req, res) => memberRequestController.getMemberRequests(req, res));

/**
 * @swagger
 * /api/families/{id}/member-requests/{requestId}:
 *   put:
 *     summary: Approve or reject member request (admin only)
 *     tags: [Member Requests]
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
 *         description: Request ID
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
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can approve/reject
 *       404:
 *         description: Request not found
 *       409:
 *         description: Request already processed
 */
router.put('/:id/member-requests/:requestId', authenticateToken, (req, res) => memberRequestController.handleMemberRequest(req, res));

export default router;
