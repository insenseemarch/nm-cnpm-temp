import prisma from "../utils/prisma";
import notificationService from "./notification.service";

export class FamilyService {
  /**
   * Generate unique 4-digit family ID
   */
  private async generateFamilyId(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      // Generate random 4-digit number (1000-9999)
      const id = Math.floor(1000 + Math.random() * 9000).toString();

      // Check if ID exists
      const existing = await prisma.family.findUnique({
        where: { id },
      });

      if (!existing) {
        return id;
      }

      attempts++;
    }

    throw new Error("Failed to generate unique family ID");
  }

  /**
   * Create a new family
   */
  async createFamily(
    userId: string,
    data: {
      name: string;
      description?: string;
    }
  ) {
    // Generate unique 4-digit ID
    const familyId = await this.generateFamilyId();

    // Create family with creator as admin
    const family = await prisma.family.create({
      data: {
        id: familyId,
        name: data.name,
        description: data.description || null,
        adminId: userId,
        users: {
          connect: { id: userId }, // Auto add creator to family members
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            users: true,
          },
        },
      },
    });

    return family;
  }

  /**
   * Get all families where user is admin or member
   */
  async getUserFamilies(userId: string) {
    const families = await prisma.family.findMany({
      where: {
        OR: [{ adminId: userId }, { users: { some: { id: userId } } }],
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return families;
  }

  /**
   * Get family by ID with details
   */
  async getFamilyById(familyId: string, userId: string) {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            events: true,
            achievements: true,
          },
        },
      },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    // Check if user has access to this family
    const hasAccess =
      family.adminId === userId || family.users.some((u) => u.id === userId);

    if (!hasAccess) {
      throw new Error("You do not have access to this family");
    }

    return family;
  }

  /**
   * Update family information (admin only)
   */
  async updateFamily(
    familyId: string,
    userId: string,
    data: {
      name?: string;
      description?: string;
    }
  ) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== userId) {
      throw new Error("Only admin can update family information");
    }

    // Update family
    const updateData: { name?: string; description?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;

    const updated = await prisma.family.update({
      where: { id: familyId },
      data: updateData,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            members: true,
            users: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Delete family (admin only)
   */
  async deleteFamily(familyId: string, userId: string) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== userId) {
      throw new Error("Only admin can delete family");
    }

    // Delete family (cascade will handle related data)
    await prisma.family.delete({
      where: { id: familyId },
    });

    return { message: "Family deleted successfully" };
  }

  /**
   * Request to join a family
   */
  async createJoinRequest(familyId: string, userId: string, message?: string) {
    // Check if family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    // Check if user is already a member
    const isMember = await prisma.family.findFirst({
      where: {
        id: familyId,
        OR: [{ adminId: userId }, { users: { some: { id: userId } } }],
      },
    });

    if (isMember) {
      throw new Error("You are already a member of this family");
    }

    // Check if request already exists
    const existingRequest = await prisma.familyJoinRequest.findUnique({
      where: {
        familyId_userId: {
          familyId,
          userId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        throw new Error("You already have a pending request for this family");
      }
      if (existingRequest.status === "APPROVED") {
        throw new Error("Your request has already been approved");
      }
      // If REJECTED, allow creating new request
      await prisma.familyJoinRequest.delete({
        where: { id: existingRequest.id },
      });
    }

    // Create join request
    const request = await prisma.familyJoinRequest.create({
      data: {
        familyId,
        userId,
        message: message || null,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
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

    // Send notification to family admin
    try {
      await notificationService.createNotification({
        userId: family.adminId,
        senderId: userId,
        familyId,
        type: "JOIN_REQUEST",
        title: "Yêu cầu tham gia gia đình",
        message: `${request.user.name} đã gửi yêu cầu tham gia gia đình ${request.family.name}`,
        data: {
          requestId: request.id,
          personName: request.user.name,
        },
      });
    } catch (error) {
      console.error("Failed to create JOIN_REQUEST notification:", error);
    }

    return request;
  }

  /**
   * Get all join requests for a family (admin only)
   */
  async getFamilyJoinRequests(
    familyId: string,
    userId: string,
    status?: "PENDING" | "APPROVED" | "REJECTED"
  ) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== userId) {
      throw new Error("Only admin can view join requests");
    }

    // Get requests
    const requests = await prisma.familyJoinRequest.findMany({
      where: {
        familyId,
        ...(status && { status }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return requests;
  }

  /**
   * Approve or reject join request (admin only)
   */
  async handleJoinRequest(
    familyId: string,
    requestId: string,
    adminId: string,
    action: "APPROVE" | "REJECT"
  ) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== adminId) {
      throw new Error("Only admin can approve/reject join requests");
    }

    // Get request
    const request = await prisma.familyJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error("Join request not found");
    }

    if (request.familyId !== familyId) {
      throw new Error("Request does not belong to this family");
    }

    if (request.status !== "PENDING") {
      throw new Error("Request has already been processed");
    }

    if (action === "APPROVE") {
      // Approve: Add user to family and update request
      await prisma.$transaction([
        // Add user to family
        prisma.family.update({
          where: { id: familyId },
          data: {
            users: {
              connect: { id: request.userId },
            },
          },
        }),
        // Update request status
        prisma.familyJoinRequest.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            approvedBy: adminId,
            approvedAt: new Date(),
          },
        }),
      ]);

      // Send JOIN_APPROVED notification to requester
      try {
        const familyInfo = await prisma.family.findUnique({
          where: { id: familyId },
          select: { name: true },
        });
        await notificationService.createNotification({
          userId: request.userId,
          senderId: adminId,
          familyId,
          type: "JOIN_APPROVED",
          title: "Yêu cầu tham gia được chấp nhận",
          message: `Yêu cầu tham gia gia đình ${
            familyInfo?.name || "gia đình"
          } của bạn đã được chấp nhận`,
          data: {
            requestId: request.id,
            familyName: familyInfo?.name,
          },
        });
      } catch (error) {
        console.error("Failed to create JOIN_APPROVED notification:", error);
      }

      return {
        message: "Join request approved successfully",
        user: request.user,
      };
    } else {
      // Reject: Just update request status
      await prisma.familyJoinRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });

      // Send JOIN_REJECTED notification to requester
      try {
        const familyInfo = await prisma.family.findUnique({
          where: { id: familyId },
          select: { name: true },
        });
        await notificationService.createNotification({
          userId: request.userId,
          senderId: adminId,
          familyId,
          type: "JOIN_REJECTED",
          title: "Yêu cầu tham gia bị từ chối",
          message: `Yêu cầu tham gia gia đình ${
            familyInfo?.name || "gia đình"
          } của bạn đã bị từ chối`,
          data: {
            requestId: request.id,
            familyName: familyInfo?.name,
          },
        });
      } catch (error) {
        console.error("Failed to create JOIN_REJECTED notification:", error);
      }

      return {
        message: "Join request rejected",
        user: request.user,
      };
    }
  }

  /**
   * Get link suggestions for join request (Phase 2)
   */
  async getJoinRequestSuggestions(
    familyId: string,
    requestId: string,
    adminId: string
  ) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== adminId) {
      throw new Error("Only admin can view suggestions");
    }

    // Get request
    const request = await prisma.familyJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error("Join request not found");
    }

    if (request.familyId !== familyId) {
      throw new Error("Request does not belong to this family");
    }

    // Get all members in family
    const members = await prisma.familyMember.findMany({
      where: {
        familyId,
        isDeleted: false,
        linkedUserId: null, // Only unlinked members
      },
      select: {
        id: true,
        name: true,
        email: true,
        generation: true,
        birthDate: true,
      },
    });

    // Check auto-match: email AND name must match
    const autoMatch = members.find(
      (m) =>
        m.email?.toLowerCase() === request.user.email.toLowerCase() &&
        this.namesMatch(m.name, request.user.name)
    );

    // Find possible matches by name similarity
    const possibleMatches = members
      .map((m) => ({
        ...m,
        similarity: this.calculateNameSimilarity(m.name, request.user.name),
      }))
      .filter((m) => m.similarity > 0.5) // Only show if >50% similar
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10); // Top 10 matches

    return {
      user: request.user,
      autoMatch: autoMatch
        ? {
            found: true,
            member: autoMatch,
          }
        : {
            found: false,
            member: null,
          },
      possibleMatches,
    };
  }

  /**
   * Handle join request with linking option (Phase 2)
   */
  async handleJoinRequestWithLink(
    familyId: string,
    requestId: string,
    adminId: string,
    action: "APPROVE" | "REJECT",
    linkOption?: "AUTO" | "MANUAL" | "NEW",
    memberId?: string
  ) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== adminId) {
      throw new Error("Only admin can approve/reject join requests");
    }

    // Get request
    const request = await prisma.familyJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error("Join request not found");
    }

    if (request.familyId !== familyId) {
      throw new Error("Request does not belong to this family");
    }

    if (request.status !== "PENDING") {
      throw new Error("Request has already been processed");
    }

    if (action === "REJECT") {
      // Simple reject
      await prisma.familyJoinRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      });

      return {
        message: "Join request rejected",
        user: request.user,
      };
    }

    // APPROVE with linking
    let linkedMemberId: string | null = null;

    if (linkOption === "AUTO") {
      // Find auto-match member
      const autoMatch = await prisma.familyMember.findFirst({
        where: {
          familyId,
          isDeleted: false,
          linkedUserId: null,
          email: request.user.email,
        },
      });

      if (!autoMatch) {
        throw new Error(
          "No auto-match member found. Please use MANUAL or NEW option."
        );
      }

      linkedMemberId = autoMatch.id;
    } else if (linkOption === "MANUAL") {
      if (!memberId) {
        throw new Error("Member ID is required for MANUAL link option");
      }

      // Validate member exists and is unlinked
      const member = await prisma.familyMember.findFirst({
        where: {
          id: memberId,
          familyId,
          isDeleted: false,
          linkedUserId: null,
        },
      });

      if (!member) {
        throw new Error("Member not found or already linked");
      }

      // Validate name similarity
      if (!this.namesMatch(member.name, request.user.name)) {
        throw new Error("Member name does not match user name closely enough");
      }

      linkedMemberId = memberId;
    }
    // If linkOption === 'NEW' or undefined, linkedMemberId stays null

    // Execute approval with transaction
    await prisma.$transaction(async (tx) => {
      // Add user to family
      await tx.family.update({
        where: { id: familyId },
        data: {
          users: {
            connect: { id: request.userId },
          },
        },
      });

      // Link member if applicable
      if (linkedMemberId) {
        await tx.familyMember.update({
          where: { id: linkedMemberId },
          data: {
            linkedUserId: request.userId,
            email: request.user.email, // Update email
            isVerified: true,
          },
        });
      }

      // Update request status
      await tx.familyJoinRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          approvedBy: adminId,
          approvedAt: new Date(),
          approvalData: {
            linkOption: linkOption || "NEW",
            linkedMemberId: linkedMemberId || null,
          },
        },
      });
    });

    return {
      message: "Join request approved successfully",
      user: request.user,
      linkedMember: linkedMemberId ? { id: linkedMemberId } : null,
    };
  }

  /**
   * Helper: Check if two names match closely
   */
  private namesMatch(name1: string, name2: string): boolean {
    const similarity = this.calculateNameSimilarity(name1, name2);
    return similarity >= 0.7; // 70% similarity threshold
  }

  /**
   * Helper: Calculate name similarity (simple Levenshtein-based)
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const n1 = name1.toLowerCase().trim();
    const n2 = name2.toLowerCase().trim();

    if (n1 === n2) return 1.0;

    // Simple word-based comparison
    const words1 = n1.split(/\s+/);
    const words2 = n2.split(/\s+/);

    let matchCount = 0;
    for (const w1 of words1) {
      if (words2.some((w2) => w2.includes(w1) || w1.includes(w2))) {
        matchCount++;
      }
    }

    return matchCount / Math.max(words1.length, words2.length);
  }

  /**
   * Leave family (unlink member node, remove from users)
   */
  async leaveFamily(familyId: string, userId: string) {
    // Check if user is member
    const family = await prisma.family.findFirst({
      where: {
        id: familyId,
        users: { some: { id: userId } },
      },
      select: {
        adminId: true,
        _count: {
          select: { users: true },
        },
      },
    });

    if (!family) {
      throw new Error("You are not a member of this family");
    }

    // Check if user is admin
    if (family.adminId === userId) {
      // Admin cannot leave without transferring admin role
      if (family._count.users > 1) {
        throw new Error("Admin must transfer admin role before leaving");
      }
      // If admin is the only member, can leave (family will be empty)
    }

    // Find linked member (if any)
    const linkedMember = await prisma.familyMember.findFirst({
      where: {
        familyId,
        linkedUserId: userId,
        isDeleted: false,
      },
    });

    // Execute leave with transaction
    await prisma.$transaction(async (tx) => {
      // Unlink member if exists
      if (linkedMember) {
        await tx.familyMember.update({
          where: { id: linkedMember.id },
          data: {
            linkedUserId: null,
            isVerified: false,
          },
        });
      }

      // Remove user from family
      await tx.family.update({
        where: { id: familyId },
        data: {
          users: {
            disconnect: { id: userId },
          },
        },
      });
    });

    return {
      message: "Left family successfully",
      unlinkedMember: linkedMember
        ? { id: linkedMember.id, name: linkedMember.name }
        : null,
    };
  }

  /**
   * Transfer admin role to another user
   */
  async transferAdmin(
    familyId: string,
    currentAdminId: string,
    newAdminId: string
  ) {
    // Check if current user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: {
        adminId: true,
        users: {
          select: { id: true },
        },
      },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== currentAdminId) {
      throw new Error("Only admin can transfer admin role");
    }

    if (currentAdminId === newAdminId) {
      throw new Error("Cannot transfer admin to yourself");
    }

    // Check if new admin is a member
    const isNewAdminMember = family.users.some((u) => u.id === newAdminId);
    if (!isNewAdminMember) {
      throw new Error("New admin must be a member of the family");
    }

    // Transfer admin
    await prisma.family.update({
      where: { id: familyId },
      data: {
        adminId: newAdminId,
      },
    });

    // Get user info for notification
    const [currentAdmin, newAdmin] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentAdminId },
        select: { name: true },
      }),
      prisma.user.findUnique({
        where: { id: newAdminId },
        select: { name: true },
      }),
    ]);

    // Send ADMIN_TRANSFER notification to new admin
    try {
      await notificationService.createNotification({
        userId: newAdminId,
        senderId: currentAdminId,
        familyId,
        type: "ADMIN_TRANSFER",
        title: "Bạn đã được chuyển quyền quản trị",
        message: `${
          currentAdmin?.name || "Admin cũ"
        } đã chuyển quyền quản trị gia đình cho bạn`,
        data: {
          previousAdminId: currentAdminId,
          previousAdminName: currentAdmin?.name,
          newAdminId,
          newAdminName: newAdmin?.name,
        },
      });
    } catch (error) {
      console.error("Failed to create ADMIN_TRANSFER notification:", error);
    }

    // Notify all family members about admin change
    try {
      await notificationService.notifyFamilyMembers(
        familyId,
        currentAdminId,
        "ADMIN_TRANSFER",
        "Thay đổi quản trị viên",
        `${
          newAdmin?.name || "Thành viên mới"
        } đã trở thành quản trị viên của gia đình`,
        {
          previousAdminId: currentAdminId,
          previousAdminName: currentAdmin?.name,
          newAdminId,
          newAdminName: newAdmin?.name,
        },
        [newAdminId] // Exclude new admin since they already got notification
      );
    } catch (error) {
      console.error(
        "Failed to notify family members about ADMIN_TRANSFER:",
        error
      );
    }

    return {
      message: "Admin role transferred successfully",
      newAdminId,
    };
  }

  /**
   * Get family statistics (births, marriages, deaths by year)
   */
  async getFamilyStatistics(
    familyId: string,
    userId: string,
    fromYear?: number,
    toYear?: number
  ) {
    // Check if user has access to family
    const family = await prisma.family.findFirst({
      where: {
        id: familyId,
        OR: [{ adminId: userId }, { users: { some: { id: userId } } }],
      },
    });

    if (!family) {
      throw new Error("Family not found or access denied");
    }

    // Get all non-deleted members
    const members = await prisma.familyMember.findMany({
      where: {
        familyId,
        isDeleted: false,
      },
      select: {
        birthDate: true,
        marriageDate: true,
        deathDate: true,
      },
    });

    // Build statistics map: year -> { births, marriages, deaths }
    const statsMap = new Map<
      number,
      { births: number; marriages: number; deaths: number }
    >();

    const getOrCreateStats = (year: number) => {
      if (!statsMap.has(year)) {
        statsMap.set(year, { births: 0, marriages: 0, deaths: 0 });
      }
      return statsMap.get(year)!;
    };

    // Count events by year
    members.forEach((member) => {
      // Births
      if (member.birthDate) {
        const year = member.birthDate.getFullYear();
        if ((!fromYear || year >= fromYear) && (!toYear || year <= toYear)) {
          getOrCreateStats(year).births++;
        }
      }

      // Marriages
      if (member.marriageDate) {
        const year = member.marriageDate.getFullYear();
        if ((!fromYear || year >= fromYear) && (!toYear || year <= toYear)) {
          getOrCreateStats(year).marriages++;
        }
      }

      // Deaths
      if (member.deathDate) {
        const year = member.deathDate.getFullYear();
        if ((!fromYear || year >= fromYear) && (!toYear || year <= toYear)) {
          getOrCreateStats(year).deaths++;
        }
      }
    });

    // Convert map to sorted array (only years with events)
    const yearlyStats = Array.from(statsMap.entries())
      .map(([year, stats]) => ({
        year,
        births: stats.births,
        marriages: stats.marriages,
        deaths: stats.deaths,
      }))
      .sort((a, b) => a.year - b.year);

    // Calculate summary
    const summary = yearlyStats.reduce(
      (acc, stat) => ({
        totalBirths: acc.totalBirths + stat.births,
        totalMarriages: acc.totalMarriages + stat.marriages,
        totalDeaths: acc.totalDeaths + stat.deaths,
      }),
      { totalBirths: 0, totalMarriages: 0, totalDeaths: 0 }
    );

    return {
      yearlyStats,
      totalYearsWithEvents: yearlyStats.length,
      summary,
    };
  }
}
