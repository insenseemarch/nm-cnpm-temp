import { Request, Response } from "express";
import { MemberService } from "../services/member.service";

const memberService = new MemberService();

export class MemberController {
  /**
   * GET /api/families/:id/members
   * Get all members in a family (basic info)
   */
  async getMembers(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { status, generation, gender, search } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Family ID is required" });
      }

      const filters: any = {};
      if (status) filters.status = status as "alive" | "deceased";
      if (generation) filters.generation = parseInt(generation as string);
      if (gender) filters.gender = gender;
      if (search) filters.search = search as string;

      const members = await memberService.getFamilyMembers(
        id,
        req.user.id,
        filters
      );

      return res.status(200).json({
        data: members,
      });
    } catch (error: any) {
      console.error("Get members error:", error);

      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to get members",
      });
    }
  }

  /**
   * GET /api/families/:id/members/:memberId
   * Get member detail (full info)
   */
  async getMemberById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId } = req.params;

      if (!id || !memberId) {
        return res
          .status(400)
          .json({ error: "Family ID and Member ID are required" });
      }

      const member = await memberService.getMemberById(
        id,
        memberId,
        req.user.id
      );

      return res.status(200).json({
        data: member,
      });
    } catch (error: any) {
      console.error("Get member error:", error);

      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to get member",
      });
    }
  }

  /**
   * POST /api/families/:id/members
   * Create a new member (admin only)
   */
  async createMember(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const data = req.body;

      if (!id) {
        return res.status(400).json({ error: "Family ID is required" });
      }

      if (!data.name || !data.gender || data.generation === undefined) {
        return res.status(400).json({
          error: "Name, gender, and generation are required",
        });
      }

      // Convert birthDate string to Date if provided
      if (data.birthDate) {
        data.birthDate = new Date(data.birthDate);
      }

      // Convert marriageDate string to Date if provided
      if (data.marriageDate) {
        data.marriageDate = new Date(data.marriageDate);
      }

      // Convert deathDate string to Date if provided
      if (data.deathDate) {
        data.deathDate = new Date(data.deathDate);
      }

      const member = await memberService.createMember(id, req.user.id, data);

      return res.status(201).json({
        message: "Member created successfully",
        data: member,
      });
    } catch (error: any) {
      console.error("Create member error:", error);

      if (error.message === "Family not found") {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === "Only admin can create members") {
        return res.status(403).json({ error: error.message });
      }

      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to create member",
      });
    }
  }

  /**
   * PUT /api/families/:id/members/:memberId
   * Update member (admin only)
   */
  async updateMember(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId } = req.params;
      const data = req.body;

      if (!id || !memberId) {
        return res
          .status(400)
          .json({ error: "Family ID and Member ID are required" });
      }

      // Convert birthDate string to Date if provided
      if (data.birthDate) {
        data.birthDate = new Date(data.birthDate);
      }

      // Convert marriageDate string to Date if provided
      if (data.marriageDate) {
        data.marriageDate = new Date(data.marriageDate);
      }

      const member = await memberService.updateMember(
        id,
        memberId,
        req.user.id,
        data
      );

      return res.status(200).json({
        message: "Member updated successfully",
        data: member,
      });
    } catch (error: any) {
      console.error("Update member error:", error);

      if (
        error.message === "Family not found" ||
        error.message === "Member not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === "Only admin can update members") {
        return res.status(403).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to update member",
      });
    }
  }

  /**
   * DELETE /api/families/:id/members/:memberId
   * Delete member - soft delete (admin only)
   */
  async deleteMember(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId } = req.params;

      if (!id || !memberId) {
        return res
          .status(400)
          .json({ error: "Family ID and Member ID are required" });
      }

      const result = await memberService.deleteMember(
        id,
        memberId,
        req.user.id
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Delete member error:", error);

      if (
        error.message === "Family not found" ||
        error.message === "Member not found"
      ) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message === "Only admin can delete members") {
        return res.status(403).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to delete member",
      });
    }
  }

  /**
   * GET /api/families/:id/members/deleted
   * Get all deleted members (admin only)
   */
  async getDeletedMembers(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Family ID is required" });
      }

      const members = await memberService.getDeletedMembers(id, req.user.id);

      return res.status(200).json({
        data: members,
      });
    } catch (error: any) {
      console.error("Get deleted members error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Only admin")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to get deleted members",
      });
    }
  }

  /**
   * POST /api/families/:id/members/:memberId/restore
   * Restore a deleted member (admin only)
   */
  async restoreMember(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId } = req.params;

      if (!id || !memberId) {
        return res
          .status(400)
          .json({ error: "Family ID and Member ID are required" });
      }

      const result = await memberService.restoreMember(
        id,
        memberId,
        req.user.id
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Restore member error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Only admin")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to restore member",
      });
    }
  }

  /**
   * DELETE /api/families/:id/members/:memberId/permanent
   * Permanently delete a member (admin only)
   */
  async permanentlyDeleteMember(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId } = req.params;

      if (!id || !memberId) {
        return res
          .status(400)
          .json({ error: "Family ID and Member ID are required" });
      }

      const result = await memberService.permanentlyDeleteMember(
        id,
        memberId,
        req.user.id
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Permanent delete member error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Only admin")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to permanently delete member",
      });
    }
  }

  /**
   * GET /api/families/:id/yearly-report
   * Get yearly statistics for family
   */
  async getYearlyReport(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      const { year, startYear, endYear } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Family ID is required" });
      }

      const report = await memberService.getYearlyReport(
        id,
        req.user.id,
        year ? parseInt(year as string) : undefined,
        startYear ? parseInt(startYear as string) : undefined,
        endYear ? parseInt(endYear as string) : undefined
      );

      return res.status(200).json({
        data: report,
      });
    } catch (error: any) {
      console.error("Get yearly report error:", error);

      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to get yearly report",
      });
    }
  }

  /**
   * GET /api/families/:id/members/:memberId/achievements
   * Get all achievements for a member
   */
  async getMemberAchievements(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId } = req.params;

      if (!id || !memberId) {
        return res
          .status(400)
          .json({ error: "Family ID and Member ID are required" });
      }

      const achievements = await memberService.getMemberAchievements(
        id,
        memberId,
        req.user.id
      );

      return res.status(200).json({
        data: achievements,
      });
    } catch (error: any) {
      console.error("Get member achievements error:", error);

      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to get member achievements",
      });
    }
  }

  /**
   * POST /api/families/:id/members/:memberId/achievements
   * Create a new achievement for member
   */
  async createMemberAchievement(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId } = req.params;
      const data = req.body;

      if (!id || !memberId) {
        return res
          .status(400)
          .json({ error: "Family ID and Member ID are required" });
      }

      if (!data.title || !data.category || !data.achievedAt) {
        return res.status(400).json({
          error: "Title, category, and achievedAt are required",
        });
      }

      if (data.achievedAt) {
        data.achievedAt = new Date(data.achievedAt);
      }

      const achievement = await memberService.createMemberAchievement(
        id,
        memberId,
        req.user.id,
        data
      );

      return res.status(201).json({
        message: "Achievement created successfully",
        data: achievement,
      });
    } catch (error: any) {
      console.error("Create member achievement error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Only admin")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to create achievement",
      });
    }
  }

  /**
   * PUT /api/families/:id/members/:memberId/achievements/:achievementId
   * Update member achievement
   */
  async updateMemberAchievement(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId, achievementId } = req.params;
      const data = req.body;

      if (!id || !memberId || !achievementId) {
        return res.status(400).json({
          error: "Family ID, Member ID, and Achievement ID are required",
        });
      }

      if (data.achievedAt) {
        data.achievedAt = new Date(data.achievedAt);
      }

      const achievement = await memberService.updateMemberAchievement(
        id,
        memberId,
        achievementId,
        req.user.id,
        data
      );

      return res.status(200).json({
        message: "Achievement updated successfully",
        data: achievement,
      });
    } catch (error: any) {
      console.error("Update member achievement error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Only admin")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to update achievement",
      });
    }
  }

  /**
   * DELETE /api/families/:id/members/:memberId/achievements/:achievementId
   * Delete member achievement
   */
  async deleteMemberAchievement(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id, memberId, achievementId } = req.params;

      if (!id || !memberId || !achievementId) {
        return res.status(400).json({
          error: "Family ID, Member ID, and Achievement ID are required",
        });
      }

      const result = await memberService.deleteMemberAchievement(
        id,
        memberId,
        achievementId,
        req.user.id
      );

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Delete member achievement error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }

      if (error.message.includes("Only admin")) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(400).json({
        error: error.message || "Failed to delete achievement",
      });
    }
  }
}
