import prisma from "../utils/prisma";
import { Gender, MaritalStatus } from "@prisma/client";
import notificationService from "./notification.service";

export class MemberService {
  /**
   * Get all members in a family (basic info for list/cards)
   */
  async getFamilyMembers(
    familyId: string,
    userId: string,
    filters?: {
      status?: "alive" | "deceased";
      generation?: number;
      gender?: Gender;
      search?: string;
    }
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

    // Build where clause
    const where: any = {
      familyId,
      isDeleted: false,
    };

    if (filters?.status === "alive") {
      where.deathDate = null;
    } else if (filters?.status === "deceased") {
      where.deathDate = { not: null };
    }

    if (filters?.generation !== undefined) {
      where.generation = filters.generation;
    }

    if (filters?.gender) {
      where.gender = filters.gender;
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: "insensitive", // Case-insensitive search
      };
    }

    // Get members with basic info
    const members = await prisma.familyMember.findMany({
      where,
      select: {
        id: true,
        name: true,
        gender: true,
        generation: true,
        birthDate: true,
        deathDate: true,
        avatar: true,
        maritalStatus: true,
        fatherId: true,
        motherId: true,
        spouseId: true,
        linkedUserId: true,
        isDeleted: true,
      },
      orderBy: [{ generation: "asc" }, { birthDate: "asc" }],
    });

    return members;
  }

  /**
   * Get member detail (full info for profile page)
   */
  async getMemberById(familyId: string, memberId: string, userId: string) {
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

    // Get member with full details
    const member = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId,
        isDeleted: false,
      },
      include: {
        father: {
          select: {
            id: true,
            name: true,
            avatar: true,
            birthDate: true,
            deathDate: true,
          },
        },
        mother: {
          select: {
            id: true,
            name: true,
            avatar: true,
            birthDate: true,
            deathDate: true,
          },
        },
        spouse: {
          select: {
            id: true,
            name: true,
            avatar: true,
            birthDate: true,
            deathDate: true,
          },
        },
        fatherChildren: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            avatar: true,
            gender: true,
            birthDate: true,
            deathDate: true,
          },
        },
        motherChildren: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            avatar: true,
            gender: true,
            birthDate: true,
            deathDate: true,
          },
        },
        linkedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    // Combine children from both father and mother relations
    const childrenMap = new Map();
    [...member.fatherChildren, ...member.motherChildren].forEach((child) => {
      childrenMap.set(child.id, child);
    });
    const allChildren = Array.from(childrenMap.values());

    // Get siblings: people who share the same father or mother (excluding self)
    const whereConditions = [];
    if (member.fatherId) {
      whereConditions.push({ fatherId: member.fatherId });
    }
    if (member.motherId) {
      whereConditions.push({ motherId: member.motherId });
    }

    let siblings: Array<{
      id: string;
      name: string;
      avatar: string | null;
      gender: Gender;
      birthDate: Date | null;
      deathDate: Date | null;
    }> = [];

    if (whereConditions.length > 0) {
      siblings = await prisma.familyMember.findMany({
        where: {
          familyId,
          isDeleted: false,
          id: { not: memberId },
          OR: whereConditions,
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          gender: true,
          birthDate: true,
          deathDate: true,
        },
        orderBy: { birthDate: "asc" },
      });
    }

    // Determine myOrder based on siblings + self
    let myOrder = member.childOrder; // Priority 1: User-provided childOrder

    if (!myOrder && (member.fatherId || member.motherId)) {
      // Priority 2: Calculate from birthDate among siblings
      const allSiblings = [
        ...siblings,
        {
          id: member.id,
          birthDate: member.birthDate,
        },
      ].sort((a, b) => {
        if (!a.birthDate && !b.birthDate) return 0;
        if (!a.birthDate) return 1;
        if (!b.birthDate) return -1;
        return a.birthDate.getTime() - b.birthDate.getTime();
      });

      const myIndex = allSiblings.findIndex((s) => s.id === member.id);
      myOrder = myIndex >= 0 ? myIndex + 1 : null;
    }

    // Remove duplicate fields and add siblings info
    const { fatherChildren, motherChildren, ...memberData } = member;

    return {
      ...memberData,
      fatherChildren: allChildren, // Con của member (nếu là cha)
      motherChildren: allChildren, // Con của member (nếu là mẹ) - sẽ được merge ở frontend
      siblings, // Anh chị em (không bao gồm mình)
      myOrder, // Con thứ mấy (childOrder hoặc tính từ birthDate)
      totalSiblings: siblings.length + 1, // Tổng số anh chị em (bao gồm mình)
    };
  }

  /**
   * Create a new family member (admin only)
   */
  async createMember(
    familyId: string,
    userId: string,
    data: {
      name: string;
      gender: Gender;
      generation: number;
      childOrder?: number; // Con thứ mấy (user-provided)
      email?: string;
      birthDate?: Date;
      occupation?: string;
      customOccupation?: string;
      hometown?: string;
      currentAddress?: string;
      maritalStatus?: MaritalStatus;
      marriageDate?: Date;
      deathDate?: Date;
      avatar?: string;
      bio?: string;
      fatherId?: string;
      motherId?: string;
      spouseId?: string;
      isMe?: boolean; // NEW: Auto-link this member to current user
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
      throw new Error("Only admin can create members");
    }

    // Validate isMe: Check if user already linked to another member
    // This should be checked FIRST to give clear error message
    if (data.isMe) {
      const existingLink = await prisma.familyMember.findFirst({
        where: {
          familyId,
          linkedUserId: userId,
          isDeleted: false,
        },
      });

      if (existingLink) {
        throw new Error(
          "You are already linked to another member in this family"
        );
      }
    }

    if (data.fatherId && data.motherId) {
      const p1 = await prisma.familyMember.findFirst({
        where: { id: data.fatherId, familyId, isDeleted: false },
      });
      const p2 = await prisma.familyMember.findFirst({
        where: { id: data.motherId, familyId, isDeleted: false },
      });

      if (p1 && p2) {
        if (p1.generation !== p2.generation) {
          throw new Error("Father and mother must be in the same generation");
        }

        // Swap logic: If p1 is Female or p2 is Male, they are in the wrong slots
        if (p1.gender === "FEMALE" || p2.gender === "MALE") {
          const tempId = data.fatherId;
          data.fatherId = data.motherId;
          data.motherId = tempId;
        }
      }
    }

    // 2. Individual validations (after potential swap)
    if (data.fatherId) {
      const father = await prisma.familyMember.findFirst({
        where: { id: data.fatherId, familyId, isDeleted: false },
      });
      if (!father) throw new Error("Father not found");
      if (father.gender === "FEMALE")
        throw new Error("Father cannot be female");
      if (father.generation >= data.generation)
        throw new Error(
          "Father generation must be less than member generation"
        );
    }

    if (data.motherId) {
      const mother = await prisma.familyMember.findFirst({
        where: { id: data.motherId, familyId, isDeleted: false },
      });
      if (!mother) throw new Error("Mother not found");
      if (mother.gender === "MALE") throw new Error("Mother cannot be male");
      if (mother.generation >= data.generation)
        throw new Error(
          "Mother generation must be less than member generation"
        );
    }

    // 3. Auto-assign other parent if one parent has spouse
    if (data.fatherId && !data.motherId) {
      const p1 = await prisma.familyMember.findFirst({
        where: { id: data.fatherId, familyId, isDeleted: false },
        include: { spouse: true, spouseOf: true },
      });
      const p2 = p1?.spouse || p1?.spouseOf;
      if (p2) {
        if (p1!.gender === "MALE") {
          data.motherId = p2.id;
        } else if (p1!.gender === "OTHER") {
          if (p2.gender === "MALE") {
            data.motherId = p1!.id;
            data.fatherId = p2.id;
          } else {
            data.motherId = p2.id;
          }
        }
      }
    }

    if (data.motherId && !data.fatherId) {
      const p1 = await prisma.familyMember.findFirst({
        where: { id: data.motherId, familyId, isDeleted: false },
        include: { spouse: true, spouseOf: true },
      });
      const p2 = p1?.spouse || p1?.spouseOf;
      if (p2) {
        if (p1!.gender === "FEMALE") {
          data.fatherId = p2.id;
        } else if (p1!.gender === "OTHER") {
          if (p2.gender === "FEMALE") {
            data.fatherId = p1!.id;
            data.motherId = p2.id;
          } else {
            data.fatherId = p2.id;
          }
        }
      }
    }

    if (data.spouseId) {
      const spouse = await prisma.familyMember.findFirst({
        where: { id: data.spouseId, familyId, isDeleted: false },
      });
      if (!spouse) {
        throw new Error("Spouse not found");
      }
      // Validate spouse is different gender (allow OTHER)
      if (
        data.gender !== "OTHER" &&
        spouse.gender !== "OTHER" &&
        spouse.gender === data.gender
      ) {
        throw new Error("Spouse must be different gender");
      }
    }

    // Create member
    const member = await prisma.familyMember.create({
      data: {
        familyId,
        name: data.name,
        gender: data.gender,
        generation: data.generation,
        childOrder: data.childOrder || null,
        email: data.email || null,
        birthDate: data.birthDate || null,
        occupation: data.occupation || null,
        customOccupation: data.customOccupation || null,
        hometown: data.hometown || null,
        currentAddress: data.currentAddress || null,
        maritalStatus: data.maritalStatus || "SINGLE",
        marriageDate: data.marriageDate || null,
        deathDate: data.deathDate || null,
        avatar: data.avatar || null,
        bio: data.bio || null,
        fatherId: data.fatherId || null,
        motherId: data.motherId || null,
        spouseId: data.spouseId || null,
        // Auto-link if isMe is true
        linkedUserId: data.isMe ? userId : null,
        isVerified: data.isMe ? true : false,
      },
    });

    // Update reciprocal spouse relationship
    // When A has spouseId = B, then B should also have spouseId = A
    if (data.spouseId) {
      await prisma.familyMember.update({
        where: { id: data.spouseId },
        data: {
          spouseId: member.id,
          // Also update spouse's marital status if not already married
          maritalStatus: "MARRIED",
        },
      });

      // Update new member's marital status to MARRIED
      await prisma.familyMember.update({
        where: { id: member.id },
        data: { maritalStatus: "MARRIED" },
      });
    }

    return member;
  }

  /**
   * Update family member (admin only)
   */
  async updateMember(
    familyId: string,
    memberId: string,
    userId: string,
    data: Partial<{
      name: string;
      email: string;
      gender: Gender;
      birthDate: Date;
      occupation: string;
      customOccupation: string;
      hometown: string;
      currentAddress: string;
      maritalStatus: MaritalStatus;
      marriageDate: Date;
      avatar: string;
      bio: string;
      fatherId: string;
      motherId: string;
      spouseId: string;
    }>
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
      throw new Error("Only admin can update members");
    }

    // Check member exists
    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, familyId, isDeleted: false },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    // Merge current data with updates for validation
    const mergedData = {
      ...member,
      ...data,
    };

    // 1. Consistency check and swap for OTHER gender
    const finalFatherId =
      data.fatherId !== undefined ? data.fatherId : member.fatherId;
    const finalMotherId =
      data.motherId !== undefined ? data.motherId : member.motherId;

    if (finalFatherId && finalMotherId) {
      const p1 = await prisma.familyMember.findFirst({
        where: { id: finalFatherId, familyId, isDeleted: false },
      });
      const p2 = await prisma.familyMember.findFirst({
        where: { id: finalMotherId, familyId, isDeleted: false },
      });

      if (p1 && p2) {
        if (p1.generation !== p2.generation) {
          throw new Error("Father and mother must be in the same generation");
        }

        if (p1.gender === "FEMALE" || p2.gender === "MALE") {
          data.fatherId = p2.id;
          data.motherId = p1.id;
        }
      }
    }

    // 2. Individual validations
    const validatedFatherId =
      data.fatherId !== undefined ? data.fatherId : member.fatherId;
    if (validatedFatherId) {
      const father = await prisma.familyMember.findFirst({
        where: { id: validatedFatherId, familyId, isDeleted: false },
      });
      if (father && father.gender === "FEMALE")
        throw new Error("Father cannot be female");
      if (father && father.generation >= mergedData.generation)
        throw new Error(
          "Father generation must be less than member generation"
        );
    }

    const validatedMotherId =
      data.motherId !== undefined ? data.motherId : member.motherId;
    if (validatedMotherId) {
      const mother = await prisma.familyMember.findFirst({
        where: { id: validatedMotherId, familyId, isDeleted: false },
      });
      if (mother && mother.gender === "MALE")
        throw new Error("Mother cannot be male");
      if (mother && mother.generation >= mergedData.generation)
        throw new Error(
          "Mother generation must be less than member generation"
        );
    }

    if (data.spouseId !== undefined && data.spouseId) {
      const spouse = await prisma.familyMember.findFirst({
        where: { id: data.spouseId, familyId, isDeleted: false },
      });
      if (!spouse) {
        throw new Error("Spouse not found");
      }
      if (spouse.id === memberId) {
        throw new Error("Cannot set spouse to yourself");
      }
      const finalGender =
        data.gender !== undefined ? data.gender : member.gender;
      if (
        finalGender !== "OTHER" &&
        spouse.gender !== "OTHER" &&
        spouse.gender === finalGender
      ) {
        throw new Error("Spouse must be different gender");
      }
      // Check if new spouse already has a different spouse
      if (spouse.spouseId && spouse.spouseId !== memberId) {
        throw new Error("Selected spouse is already married to another member");
      }
    }

    // Handle spouse relationship changes
    const oldSpouseId = member.spouseId;
    const newSpouseId =
      data.spouseId !== undefined ? data.spouseId : member.spouseId;

    // Build update data
    const updateData: any = {};
    Object.keys(data).forEach((key) => {
      if (data[key as keyof typeof data] !== undefined) {
        updateData[key] = data[key as keyof typeof data];
      }
    });

    // Update member
    const updated = await prisma.familyMember.update({
      where: { id: memberId },
      data: updateData,
    });

    // Handle reciprocal spouse relationship updates
    if (data.spouseId !== undefined) {
      // If old spouse exists and is being changed/removed
      if (oldSpouseId && oldSpouseId !== newSpouseId) {
        // Remove old spouse's reference to this member
        await prisma.familyMember.update({
          where: { id: oldSpouseId },
          data: {
            spouseId: null,
            maritalStatus: "SINGLE", // or keep as DIVORCED?
          },
        });
      }

      // If new spouse is set
      if (newSpouseId) {
        // Update new spouse to point back to this member
        await prisma.familyMember.update({
          where: { id: newSpouseId },
          data: {
            spouseId: memberId,
            maritalStatus: "MARRIED",
          },
        });

        // Also ensure current member's marital status is MARRIED
        if (updated.maritalStatus !== "MARRIED") {
          await prisma.familyMember.update({
            where: { id: memberId },
            data: { maritalStatus: "MARRIED" },
          });
        }
      }
    }

    return updated;
  }

  /**
   * Delete family member - soft delete (admin only)
   * Stores relationships in deletedData for potential restore
   */
  async deleteMember(familyId: string, memberId: string, userId: string) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== userId) {
      throw new Error("Only admin can delete members");
    }

    // Check member exists
    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, familyId, isDeleted: false },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    // Collect children IDs before clearing
    const childrenWithFather = await prisma.familyMember.findMany({
      where: { fatherId: memberId, familyId, isDeleted: false },
      select: { id: true },
    });
    const childrenWithMother = await prisma.familyMember.findMany({
      where: { motherId: memberId, familyId, isDeleted: false },
      select: { id: true },
    });

    // Store all relationships for restore
    const deletedData = {
      spouseId: member.spouseId,
      fatherId: member.fatherId,
      motherId: member.motherId,
      childrenAsFather: childrenWithFather.map((c) => c.id),
      childrenAsMother: childrenWithMother.map((c) => c.id),
    };

    // Remove spouse relationship if exists
    if (member.spouseId) {
      await prisma.familyMember.update({
        where: { id: member.spouseId },
        data: {
          spouseId: null,
          maritalStatus: member.deathDate ? "SINGLE" : "SINGLE",
        },
      });
    }

    // Remove parent references from children (set to null)
    if (member.gender === "MALE") {
      await prisma.familyMember.updateMany({
        where: { fatherId: memberId, familyId, isDeleted: false },
        data: { fatherId: null },
      });
    } else if (member.gender === "FEMALE") {
      await prisma.familyMember.updateMany({
        where: { motherId: memberId, familyId, isDeleted: false },
        data: { motherId: null },
      });
    }

    // Soft delete with stored data
    await (prisma.familyMember.update as any)({
      where: { id: memberId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
        spouseId: null,
        deletedData: deletedData,
      },
    });

    return { message: "Member deleted successfully" };
  }

  /**
   * Get all deleted members in family (admin only)
   */
  async getDeletedMembers(familyId: string, userId: string) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== userId) {
      throw new Error("Only admin can view deleted members");
    }

    const deletedMembers = await prisma.familyMember.findMany({
      where: { familyId, isDeleted: true },
      orderBy: { deletedAt: "desc" },
    });

    return deletedMembers;
  }

  /**
   * Restore deleted member (admin only)
   * Restores relationships stored in deletedData
   */
  async restoreMember(familyId: string, memberId: string, userId: string) {
    // Check if user is admin
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== userId) {
      throw new Error("Only admin can restore members");
    }

    // Check member is deleted
    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, familyId, isDeleted: true },
    });

    if (!member) {
      throw new Error("Deleted member not found");
    }

    const deletedData = (member as any).deletedData as {
      spouseId?: string;
      fatherId?: string;
      motherId?: string;
      childrenAsFather?: string[];
      childrenAsMother?: string[];
    } | null;

    // Restore the member first
    await (prisma.familyMember.update as any)({
      where: { id: memberId },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        deletedData: null,
        fatherId: deletedData?.fatherId || null,
        motherId: deletedData?.motherId || null,
      },
    });

    // Restore spouse relationship (if spouse still exists and doesn't have new spouse)
    if (deletedData?.spouseId) {
      const spouse = await prisma.familyMember.findFirst({
        where: {
          id: deletedData.spouseId,
          familyId,
          isDeleted: false,
        },
      });

      // Only restore if spouse exists and has no new spouse
      if (spouse && !spouse.spouseId) {
        await prisma.familyMember.update({
          where: { id: memberId },
          data: {
            spouseId: deletedData.spouseId,
            maritalStatus: "MARRIED",
          },
        });

        await prisma.familyMember.update({
          where: { id: deletedData.spouseId },
          data: {
            spouseId: memberId,
            maritalStatus: "MARRIED",
          },
        });
      }
    }

    // Restore children relationships
    if (deletedData?.childrenAsFather?.length) {
      for (const childId of deletedData.childrenAsFather) {
        const child = await prisma.familyMember.findFirst({
          where: { id: childId, familyId, isDeleted: false },
        });
        // Only restore if child still exists and has no father
        if (child && !child.fatherId) {
          await prisma.familyMember.update({
            where: { id: childId },
            data: { fatherId: memberId },
          });
        }
      }
    }

    if (deletedData?.childrenAsMother?.length) {
      for (const childId of deletedData.childrenAsMother) {
        const child = await prisma.familyMember.findFirst({
          where: { id: childId, familyId, isDeleted: false },
        });
        // Only restore if child still exists and has no mother
        if (child && !child.motherId) {
          await prisma.familyMember.update({
            where: { id: childId },
            data: { motherId: memberId },
          });
        }
      }
    }

    return { message: "Member restored successfully" };
  }

  /**
   * Permanently delete a member (admin only)
   */
  async permanentlyDeleteMember(
    familyId: string,
    memberId: string,
    userId: string
  ) {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { adminId: true },
    });

    if (!family) {
      throw new Error("Family not found");
    }

    if (family.adminId !== userId) {
      throw new Error("Only admin can permanently delete members");
    }

    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, familyId, isDeleted: true },
    });

    if (!member) {
      throw new Error("Deleted member not found");
    }

    // Delete member achievements first
    await (prisma as any).memberAchievement.deleteMany({
      where: { memberId },
    });

    // Delete addresses
    await prisma.address.deleteMany({
      where: { memberId },
    });

    // Permanently delete the member
    await prisma.familyMember.delete({
      where: { id: memberId },
    });

    return { message: "Member permanently deleted" };
  }

  /**
   * Get yearly report/statistics for family
   */
  async getYearlyReport(
    familyId: string,
    userId: string,
    year?: number,
    startYear?: number,
    endYear?: number
  ) {
    // Check user has access to family
    const family = await prisma.family.findFirst({
      where: {
        id: familyId,
        OR: [{ adminId: userId }, { users: { some: { id: userId } } }],
      },
    });

    if (!family) {
      throw new Error("Family not found or access denied");
    }

    // Build date filters
    const dateFilter: { gte?: Date; lte?: Date } | null = year
      ? {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        }
      : startYear && endYear
      ? {
          gte: new Date(`${startYear}-01-01`),
          lte: new Date(`${endYear}-12-31`),
        }
      : null;

    // Count births in period
    const birthsCount = await prisma.familyMember.count({
      where: {
        familyId,
        isDeleted: false,
        ...(dateFilter && { birthDate: dateFilter }),
      },
    });

    // Count deaths in period
    const deathsCount = await prisma.familyMember.count({
      where: {
        familyId,
        isDeleted: false,
        ...(dateFilter && { deathDate: dateFilter }),
      },
    });

    // Count marriages in period
    const marriagesCount = await prisma.familyMember.count({
      where: {
        familyId,
        isDeleted: false,
        ...(dateFilter && { marriageDate: dateFilter }),
      },
    });

    // Get members born in period
    const birthsInPeriod = await prisma.familyMember.findMany({
      where: {
        familyId,
        isDeleted: false,
        ...(dateFilter && { birthDate: dateFilter }),
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        avatar: true,
      },
      orderBy: { birthDate: "asc" },
    });

    // Get members who died in period
    const deathsInPeriod = await prisma.familyMember.findMany({
      where: {
        familyId,
        isDeleted: false,
        ...(dateFilter && { deathDate: dateFilter }),
      },
      select: {
        id: true,
        name: true,
        deathDate: true,
        gender: true,
        avatar: true,
      },
      orderBy: { deathDate: "asc" },
    });

    // Get marriages in period
    const marriagesInPeriod = await prisma.familyMember.findMany({
      where: {
        familyId,
        isDeleted: false,
        ...(dateFilter && { marriageDate: dateFilter }),
      },
      select: {
        id: true,
        name: true,
        marriageDate: true,
        gender: true,
        avatar: true,
        spouse: {
          select: { id: true, name: true, avatar: true },
        },
        spouseOf: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { marriageDate: "asc" },
    });

    // Get total active members
    const totalMembers = await prisma.familyMember.count({
      where: { familyId, isDeleted: false },
    });

    // Get total living members (no death date)
    const livingMembers = await prisma.familyMember.count({
      where: { familyId, isDeleted: false, deathDate: null },
    });

    // Get generation distribution
    const generationStats = await prisma.familyMember.groupBy({
      by: ["generation"],
      where: { familyId, isDeleted: false },
      _count: { id: true },
      orderBy: { generation: "asc" },
    });

    // Get gender distribution
    const genderStats = await prisma.familyMember.groupBy({
      by: ["gender"],
      where: { familyId, isDeleted: false },
      _count: { id: true },
    });

    return {
      period: year
        ? { year }
        : startYear && endYear
        ? { startYear, endYear }
        : { all: true },
      summary: {
        totalMembers,
        livingMembers,
        deceasedMembers: totalMembers - livingMembers,
        births: birthsCount,
        deaths: deathsCount,
        marriages: marriagesCount,
      },
      details: {
        births: birthsInPeriod,
        deaths: deathsInPeriod,
        marriages: marriagesInPeriod.map((m: any) => ({
          ...m,
          spouseInfo: m.spouse || m.spouseOf,
        })),
      },
      distributions: {
        byGeneration: generationStats.map((g) => ({
          generation: g.generation,
          count: g._count.id,
        })),
        byGender: genderStats.map((g) => ({
          gender: g.gender,
          count: g._count.id,
        })),
      },
    };
  }

  // ============ MEMBER ACHIEVEMENTS ============

  /**
   * Get all achievements for a member
   */
  async getMemberAchievements(
    familyId: string,
    memberId: string,
    userId: string
  ) {
    // Check user has access to family
    const family = await prisma.family.findFirst({
      where: {
        id: familyId,
        OR: [{ adminId: userId }, { users: { some: { id: userId } } }],
      },
    });

    if (!family) {
      throw new Error("Family not found or access denied");
    }

    const achievements = await (prisma as any).memberAchievement.findMany({
      where: { memberId },
      orderBy: { achievedAt: "desc" },
    });

    return achievements;
  }

  /**
   * Create member achievement (admin only)
   */
  async createMemberAchievement(
    familyId: string,
    memberId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      category: string;
      customCategory?: string;
      achievedAt: Date;
      images?: string[];
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
      throw new Error("Only admin can create achievements");
    }

    // Check member exists
    const member = await prisma.familyMember.findFirst({
      where: { id: memberId, familyId, isDeleted: false },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    const achievement = await (prisma as any).memberAchievement.create({
      data: {
        memberId,
        title: data.title,
        description: data.description || null,
        category: data.category,
        customCategory: data.customCategory || null,
        achievedAt: data.achievedAt,
        images: data.images || [],
      },
    });

    // Send NEW_ACHIEVEMENT notification to all family members
    try {
      await notificationService.notifyFamilyMembers(
        familyId,
        userId,
        "NEW_ACHIEVEMENT",
        "Thành tích mới",
        `${member.name} đã đạt được thành tích: ${data.title}`,
        {
          achievementId: achievement.id,
          memberId: member.id,
          memberName: member.name,
          achievementTitle: data.title,
          category: data.category,
        }
      );
    } catch (error) {
      console.error("Failed to create NEW_ACHIEVEMENT notification:", error);
    }

    return achievement;
  }

  /**
   * Update member achievement (admin only)
   */
  async updateMemberAchievement(
    familyId: string,
    memberId: string,
    achievementId: string,
    userId: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      customCategory: string;
      achievedAt: Date;
      images: string[];
    }>
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
      throw new Error("Only admin can update achievements");
    }

    // Check achievement exists
    const achievement = await (prisma as any).memberAchievement.findFirst({
      where: { id: achievementId, memberId },
    });

    if (!achievement) {
      throw new Error("Achievement not found");
    }

    const updated = await (prisma as any).memberAchievement.update({
      where: { id: achievementId },
      data,
    });

    return updated;
  }

  /**
   * Delete member achievement (admin only)
   */
  async deleteMemberAchievement(
    familyId: string,
    memberId: string,
    achievementId: string,
    userId: string
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
      throw new Error("Only admin can delete achievements");
    }

    // Check achievement exists
    const achievementToDelete = await (
      prisma as any
    ).memberAchievement.findFirst({
      where: { id: achievementId, memberId },
    });

    if (!achievementToDelete) {
      throw new Error("Achievement not found");
    }

    await (prisma as any).memberAchievement.delete({
      where: { id: achievementId },
    });

    return { message: "Achievement deleted successfully" };
  }
}
