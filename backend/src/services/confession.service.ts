import prisma from '../utils/prisma';

export type ConfessionDisplayFilter = 'all' | 'anonymous' | 'public';
export type ConfessionSort = 'desc' | 'asc';

export interface CreateConfessionInput {
  familyId: string;
  authorId: string;
  content: string;
  isAnonymous: boolean;
}

export interface ListConfessionsInput {
  familyId: string;
  userId: string;
  display?: ConfessionDisplayFilter;
  sort?: ConfessionSort;
  page?: number;
  limit?: number;
}

export class ConfessionService {
  private MAX_PER_DAY = 3;
  private MAX_LIMIT = 20;

  private buildValidationError(message: string) {
    const error: any = new Error(message);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    return error;
  }

  async ensureFamilyMembership(familyId: string, userId: string) {
    const family = await prisma.family.findFirst({
      where: {
        id: familyId,
        OR: [
          { adminId: userId },
          { users: { some: { id: userId } } },
        ],
      },
      select: { id: true, adminId: true },
    });

    if (!family) {
      const error: any = new Error('Bạn không phải thành viên của gia đình này');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return family;
  }

  async checkRateLimit(familyId: string, authorId: string) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await prisma.confession.count({
      where: {
        familyId,
        authorId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (count >= this.MAX_PER_DAY) {
      const error: any = new Error('Bạn đã vượt quá 3 tâm sự trong ngày');
      error.status = 429;
      error.code = 'RATE_LIMIT';
      throw error;
    }
  }

  async createConfession(input: CreateConfessionInput) {
    const { familyId, authorId, content, isAnonymous } = input;

    if (!content || typeof content !== 'string') {
      throw this.buildValidationError('Dữ liệu không hợp lệ');
    }
    const trimmed = content.trim();
    if (trimmed.length === 0 || trimmed.length > 1000) {
      throw this.buildValidationError('Dữ liệu không hợp lệ');
    }

    await this.ensureFamilyMembership(familyId, authorId);
    await this.checkRateLimit(familyId, authorId);

    const confession = await prisma.confession.create({
      data: {
        familyId,
        authorId,
        content: trimmed,
        isAnonymous: !!isAnonymous,
      },
      include: { author: true },
    });

    return this.mapConfession(confession);
  }

  async listConfessions(input: ListConfessionsInput) {
    const {
      familyId,
      userId,
      display = 'all',
      sort = 'desc',
      page = 1,
      limit = this.MAX_LIMIT,
    } = input;

    await this.ensureFamilyMembership(familyId, userId);

    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0
        ? Math.min(limit, this.MAX_LIMIT)
        : this.MAX_LIMIT;

    const where: any = { familyId };
    if (display === 'anonymous') where.isAnonymous = true;
    if (display === 'public') where.isAnonymous = false;

    const totalItems = await prisma.confession.count({ where });

    const items = await prisma.confession.findMany({
      where,
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      include: { author: true },
    });

    const data = items.map((c: any) => this.mapConfession(c));

    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    return { data, page: safePage, limit: safeLimit, totalItems, totalPages };
  }

  async getConfessionById(familyId: string, id: string, userId: string) {
    await this.ensureFamilyMembership(familyId, userId);

    const confession = await prisma.confession.findFirst({
      where: { id, familyId },
      include: { author: true },
    });

    if (!confession) {
      const error: any = new Error('Không tìm thấy tâm sự');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return this.mapConfession(confession);
  }

  async deleteConfession(familyId: string, id: string, userId: string) {
    const family = await this.ensureFamilyMembership(familyId, userId);

    const existing = await prisma.confession.findFirst({
      where: { id, familyId },
    });

    if (!existing) {
      const error: any = new Error('Không tìm thấy tâm sự');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Cho phép xóa nếu là admin của gia đình hoặc là tác giả của tâm sự
    if (family.adminId !== userId && existing.authorId !== userId) {
      const error: any = new Error('Chỉ admin hoặc tác giả mới được xóa tâm sự');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await prisma.confession.delete({ where: { id } });
  }

  async updateConfession(
    familyId: string,
    id: string,
    userId: string,
    data: { content?: string; isAnonymous?: boolean },
  ) {
    await this.ensureFamilyMembership(familyId, userId);

    const existing = await prisma.confession.findFirst({
      where: { id, familyId },
    });

    if (!existing) {
      const error: any = new Error('Không tìm thấy tâm sự');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Chỉ tác giả mới được sửa tâm sự của mình
    if (existing.authorId !== userId) {
      const error: any = new Error('Chỉ tác giả mới được sửa tâm sự này');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const updateData: any = {};

    if (typeof data.content !== 'undefined') {
      if (!data.content || typeof data.content !== 'string') {
        throw this.buildValidationError('Dữ liệu không hợp lệ');
      }
      const trimmed = data.content.trim();
      if (trimmed.length === 0 || trimmed.length > 1000) {
        throw this.buildValidationError('Dữ liệu không hợp lệ');
      }
      updateData.content = trimmed;
    }

    if (typeof data.isAnonymous !== 'undefined') {
      updateData.isAnonymous = !!data.isAnonymous;
    }

    if (Object.keys(updateData).length === 0) {
      throw this.buildValidationError('Không có dữ liệu nào để cập nhật');
    }

    const updated = await prisma.confession.update({
      where: { id },
      data: updateData,
      include: { author: true },
    });

    return this.mapConfession(updated);
  }

  private mapConfession(confession: any) {
    const createdAt: Date = confession.createdAt;
    const date = createdAt.toISOString().split('T')[0];
    const timestamp = createdAt.getTime();

    if (confession.isAnonymous) {
      return {
        id: confession.id,
        name: 'Ẩn danh',
        content: confession.content,
        isAnonymous: true,
        date,
        timestamp,
        avatar: undefined,
      };
    }

    return {
      id: confession.id,
      name: confession.author?.name ?? 'Ẩn danh',
      content: confession.content,
      isAnonymous: false,
      date,
      timestamp,
      avatar: confession.author?.avatar ?? undefined,
      authorId: confession.authorId,
    };
  }
}
