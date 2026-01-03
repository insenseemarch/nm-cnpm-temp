import prisma from '../utils/prisma';

export interface CreateEventInput {
  familyId: string;
  userId: string;
  name: string;
  type: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  timeZone?: string; // IANA timezone from client (e.g. "Asia/Ho_Chi_Minh")
  reminderDays?: number | null;
  description?: string | null;
}

export interface UpdateEventInput {
  familyId: string;
  userId: string;
  eventId: string;
  name?: string;
  type?: string;
  date?: string;
  time?: string;
  timeZone?: string;
  reminderDays?: number | null;
  description?: string | null;
}

export interface ListEventsInput {
  familyId: string;
  userId: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}

export class EventService {
  private buildValidationError(message: string) {
    const error: any = new Error(message);
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    return error;
  }

  private async ensureFamilyMembership(familyId: string, userId: string) {
    const family = await prisma.family.findFirst({
      where: {
        id: familyId,
        OR: [{ adminId: userId }, { users: { some: { id: userId } } }],
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

  private parseDateTime(date: string, time: string, timeZone?: string) {
    if (!date || !time) {
      throw this.buildValidationError('Ngày và giờ sự kiện không hợp lệ');
    }

    const [yearStr, monthStr, dayStr] = date.split('-');
    const [hourStr, minuteStr] = time.split(':');
    const year = Number(yearStr);
    const month = Number(monthStr) - 1; // 0-based
    const day = Number(dayStr);
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      !Number.isFinite(hour) ||
      !Number.isFinite(minute)
    ) {
      throw this.buildValidationError('Ngày và giờ sự kiện không hợp lệ');
    }

    if (timeZone) {
      try {
        const utcGuess = Date.UTC(year, month, day, hour, minute, 0);

        const dtf = new Intl.DateTimeFormat('en-US', {
          timeZone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });

        const parts = dtf.formatToParts(new Date(utcGuess));
        const get = (t: string) => parts.find((p) => p.type === t)?.value;

        const tzYear = Number(get('year'));
        const tzMonth = Number(get('month')) - 1;
        const tzDay = Number(get('day'));
        const tzHour = Number(get('hour'));
        const tzMinute = Number(get('minute'));
        const tzSecond = Number(get('second'));

        const desiredLocal = Date.UTC(year, month, day, hour, minute, 0);
        const actualLocal = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond);
        //Calculate the offset between desired UTC for db and actual local time
        const offsetMillis = desiredLocal - actualLocal;
        const finalUtcMillis = utcGuess + offsetMillis;
        const finalUtc = new Date(finalUtcMillis);

        if (isNaN(finalUtc.getTime())) {
          throw new Error('Invalid date after timezone conversion');
        }

        return finalUtc;
      } catch (e) {
        console.error('EventService.parseDateTime timezone error, falling back to UTC parse:', {
          error: e,
          date,
          time,
          timeZone,
        });
      }
    }

    const iso = `${date}T${time}:00.000Z`;
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) {
      throw this.buildValidationError('Ngày và giờ sự kiện không hợp lệ');
    }
    return dt;
  }

  private normalizeReminder(reminderDays?: number | null): string | null {
    if (reminderDays == null) return null;
    if (!Number.isFinite(reminderDays) || reminderDays < 0) {
      throw this.buildValidationError('Giá trị nhắc nhở không hợp lệ');
    }
    const minutes = Math.round(reminderDays * 24 * 60);
    return String(minutes);
  }

  async createEvent(input: CreateEventInput) {
    const { familyId, userId, name, type, date, time, timeZone, reminderDays, description } = input;

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw this.buildValidationError('Tên sự kiện là bắt buộc');
    }
    if (!type || typeof type !== 'string') {
      throw this.buildValidationError('Loại sự kiện là bắt buộc');
    }

  await this.ensureFamilyMembership(familyId, userId);

  const eventDate = this.parseDateTime(date, time, timeZone);
    const reminder = this.normalizeReminder(reminderDays);

    const event = await prisma.event.create({
      data: {
        familyId,
        createdBy: userId,
        title: name.trim(),
        eventType: type,
        eventDate,
        reminder,
        description: description?.trim() || null,
      },
    });

    return event;
  }

  async listEvents(input: ListEventsInput) {
    const { familyId, userId, startDate, endDate, type } = input;

    await this.ensureFamilyMembership(familyId, userId);

    const today = new Date();
    const start = startDate ? new Date(`${startDate}T00:00:00.000Z`) : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const end = endDate
      ? new Date(`${endDate}T23:59:59.999Z`)
      : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, today.getUTCDate()));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw this.buildValidationError('Khoảng thời gian lọc không hợp lệ');
    }

    const where: any = {
      familyId,
      eventDate: {
        gte: start,
        lte: end,
      },
    };

    if (type && type !== 'all') {
      where.eventType = type;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });

    return events;
  }

  async getEventById(familyId: string, eventId: string, userId: string) {
    await this.ensureFamilyMembership(familyId, userId);

    const event = await prisma.event.findFirst({
      where: { id: eventId, familyId },
    });

    if (!event) {
      const error: any = new Error('Không tìm thấy sự kiện');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return event;
  }

  async updateEvent(input: UpdateEventInput) {
    const { familyId, userId, eventId, name, type, date, time, timeZone, reminderDays, description } = input;

    await this.ensureFamilyMembership(familyId, userId);

    const existing = await prisma.event.findFirst({
      where: { id: eventId, familyId },
    });

    if (!existing) {
      const error: any = new Error('Không tìm thấy sự kiện');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (existing.createdBy !== userId) {
      const error: any = new Error('Chỉ người tạo sự kiện mới được chỉnh sửa');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const data: any = {};

    if (typeof name !== 'undefined') {
      if (!name || !name.trim()) {
        throw this.buildValidationError('Tên sự kiện là bắt buộc');
      }
      data.title = name.trim();
    }

    if (typeof type !== 'undefined') {
      if (!type || typeof type !== 'string') {
        throw this.buildValidationError('Loại sự kiện không hợp lệ');
      }
      data.eventType = type;
    }

    if (typeof date !== 'undefined' || typeof time !== 'undefined') {
      const currentDateStr = date ?? existing.eventDate.toISOString().slice(0, 10);
      const currentTimeStr = time ?? existing.eventDate.toISOString().slice(11, 16);
      data.eventDate = this.parseDateTime(currentDateStr, currentTimeStr, timeZone);
    }

    if (typeof reminderDays !== 'undefined') {
      data.reminder = this.normalizeReminder(reminderDays);
    }

    if (typeof description !== 'undefined') {
      data.description = description ? description.trim() : null;
    }

    if (Object.keys(data).length === 0) {
      throw this.buildValidationError('Không có dữ liệu nào để cập nhật');
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data,
    });

    return updated;
  }

  async deleteEvent(familyId: string, eventId: string, userId: string) {
    const existing = await prisma.event.findFirst({
      where: { id: eventId, familyId },
    });

    if (!existing) {
      const error: any = new Error('Không tìm thấy sự kiện');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const family = await this.ensureFamilyMembership(familyId, userId);

    if (existing.createdBy !== userId && family.adminId !== userId) {
      const error: any = new Error('Chỉ người tạo hoặc admin mới được xóa sự kiện');
      error.status = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await prisma.event.delete({ where: { id: eventId } });
  }
}

export default new EventService();
