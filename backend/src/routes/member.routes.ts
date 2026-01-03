import { Router } from "express";
import { MemberController } from "../controllers/member.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();
const memberController = new MemberController();

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Family member management endpoints
 */

/**
 * @swagger
 * /api/families/{id}/members:
 *   get:
 *     summary: Get all members in a family (basic info for list/cards)
 *     tags: [Members]
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
 *           enum: [alive, deceased]
 *         description: Filter by alive/deceased status
 *       - in: query
 *         name: generation
 *         schema:
 *           type: integer
 *         description: Filter by generation number
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [MALE, FEMALE, OTHER]
 *         description: Filter by gender
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name (case-insensitive)
 *     responses:
 *       200:
 *         description: List of members with basic info
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found or access denied
 */
router.get("/:id/members", authenticateToken, (req, res) =>
  memberController.getMembers(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}:
 *   get:
 *     summary: Get member detail (full info for profile page)
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member details with full info and relationships
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found or access denied
 */
router.get("/:id/members/:memberId", authenticateToken, (req, res) =>
  memberController.getMemberById(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members:
 *   post:
 *     summary: Create a new family member (admin only)
 *     tags: [Members]
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
 *               - name
 *               - gender
 *               - generation
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *                 example: "MALE"
 *               generation:
 *                 type: integer
 *                 example: 1
 *               childOrder:
 *                 type: integer
 *                 description: Birth order among siblings (con thứ mấy). If not provided, calculated from birthDate
 *                 example: 2
 *               email:
 *                 type: string
 *                 example: "a@example.com"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1950-01-01"
 *               occupation:
 *                 type: string
 *                 example: "Giáo viên"
 *               hometown:
 *                 type: string
 *                 example: "Hà Nội"
 *               currentAddress:
 *                 type: string
 *                 example: "123 ABC Street"
 *               maritalStatus:
 *                 type: string
 *                 enum: [SINGLE, MARRIED, DIVORCED]
 *                 example: "MARRIED"
 *               marriageDate:
 *                 type: string
 *                 format: date
 *                 example: "2020-05-15"
 *               avatar:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *               bio:
 *                 type: string
 *                 example: "Member biography"
 *               fatherId:
 *                 type: string
 *                 example: "member_id_123"
 *               motherId:
 *                 type: string
 *                 example: "member_id_456"
 *               spouseId:
 *                 type: string
 *                 example: "member_id_789"
 *               isMe:
 *                 type: boolean
 *                 description: Set to true to auto-link this member to your account
 *                 example: false
 *     responses:
 *       201:
 *         description: Member created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can create members
 *       404:
 *         description: Family or related member not found
 */
router.post("/:id/members", authenticateToken, (req, res) =>
  memberController.createMember(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}:
 *   put:
 *     summary: Update family member (admin only)
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               occupation:
 *                 type: string
 *               hometown:
 *                 type: string
 *               currentAddress:
 *                 type: string
 *               maritalStatus:
 *                 type: string
 *                 enum: [SINGLE, MARRIED, DIVORCED]
 *               marriageDate:
 *                 type: string
 *                 format: date
 *               avatar:
 *                 type: string
 *               bio:
 *                 type: string
 *               fatherId:
 *                 type: string
 *               motherId:
 *                 type: string
 *               spouseId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can update members
 *       404:
 *         description: Member not found
 */
router.put("/:id/members/:memberId", authenticateToken, (req, res) =>
  memberController.updateMember(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}:
 *   delete:
 *     summary: Delete family member - soft delete (admin only)
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can delete members
 *       404:
 *         description: Member not found
 */
router.delete("/:id/members/:memberId", authenticateToken, (req, res) =>
  memberController.deleteMember(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/deleted:
 *   get:
 *     summary: Get all deleted members (admin only)
 *     tags: [Members]
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
 *         description: List of deleted members
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can view deleted members
 */
router.get("/:id/members-deleted", authenticateToken, (req, res) =>
  memberController.getDeletedMembers(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}/restore:
 *   post:
 *     summary: Restore a deleted member (admin only)
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member restored successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can restore members
 *       404:
 *         description: Deleted member not found
 */
router.post("/:id/members/:memberId/restore", authenticateToken, (req, res) =>
  memberController.restoreMember(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}/permanent:
 *   delete:
 *     summary: Permanently delete a member (admin only)
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: Member permanently deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can permanently delete members
 *       404:
 *         description: Deleted member not found
 */
router.delete(
  "/:id/members/:memberId/permanent",
  authenticateToken,
  (req, res) => memberController.permanentlyDeleteMember(req, res)
);

/**
 * @swagger
 * /api/families/{id}/yearly-report:
 *   get:
 *     summary: Get yearly statistics for family
 *     tags: [Members]
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
 *         name: year
 *         schema:
 *           type: integer
 *         description: Specific year for report
 *       - in: query
 *         name: startYear
 *         schema:
 *           type: integer
 *         description: Start year for range filter
 *       - in: query
 *         name: endYear
 *         schema:
 *           type: integer
 *         description: End year for range filter
 *     responses:
 *       200:
 *         description: Yearly report with statistics
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Family not found or access denied
 */
router.get("/:id/yearly-report", authenticateToken, (req, res) =>
  memberController.getYearlyReport(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}/achievements:
 *   get:
 *     summary: Get all achievements for a member
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     responses:
 *       200:
 *         description: List of member achievements
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Member not found
 */
router.get(
  "/:id/members/:memberId/achievements",
  authenticateToken,
  (req, res) => memberController.getMemberAchievements(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}/achievements:
 *   post:
 *     summary: Create a new achievement for member (admin only)
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - achievedAt
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               customCategory:
 *                 type: string
 *               achievedAt:
 *                 type: string
 *                 format: date
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Achievement created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can create achievements
 *       404:
 *         description: Member not found
 */
router.post(
  "/:id/members/:memberId/achievements",
  authenticateToken,
  (req, res) => memberController.createMemberAchievement(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}/achievements/{achievementId}:
 *   put:
 *     summary: Update member achievement (admin only)
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *         description: Achievement ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               customCategory:
 *                 type: string
 *               achievedAt:
 *                 type: string
 *                 format: date
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Achievement updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can update achievements
 *       404:
 *         description: Achievement not found
 */
router.put(
  "/:id/members/:memberId/achievements/:achievementId",
  authenticateToken,
  (req, res) => memberController.updateMemberAchievement(req, res)
);

/**
 * @swagger
 * /api/families/{id}/members/{memberId}/achievements/{achievementId}:
 *   delete:
 *     summary: Delete member achievement (admin only)
 *     tags: [Members]
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
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: Member ID
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *         description: Achievement ID
 *     responses:
 *       200:
 *         description: Achievement deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only admin can delete achievements
 *       404:
 *         description: Achievement not found
 */
router.delete(
  "/:id/members/:memberId/achievements/:achievementId",
  authenticateToken,
  (req, res) => memberController.deleteMemberAchievement(req, res)
);

export default router;
