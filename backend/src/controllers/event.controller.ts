import { Request, Response } from 'express';
import eventService, {
  CreateEventInput,
  ListEventsInput,
  UpdateEventInput,
} from '../services/event.service';

export class EventController {
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.familyId as string;
      const userId = req.user.id as string;
      const { name, type, date, time, reminderDays, description, timeZone } = req.body;

      const input: CreateEventInput = {
        familyId,
        userId,
        name,
        type,
        date,
        time,
        timeZone,
        reminderDays,
        description,
      };

      const event = await eventService.createEvent(input);

      return res.status(201).json({
        message: 'Tạo sự kiện thành công',
        data: event,
      });
    } catch (err: any) {
      console.error('Create event error:', err);
      const status = err.status || 500;
      const code = err.code || (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message || (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({ error: { code, message } });
    }
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.familyId as string;
      const userId = req.user.id as string;
      const { startDate, endDate, type } = req.query as any;

      const input: ListEventsInput = {
        familyId,
        userId,
        startDate,
        endDate,
        type,
      };

      const events = await eventService.listEvents(input);

      return res.status(200).json({ data: events });
    } catch (err: any) {
      console.error('List events error:', err);
      const status = err.status || 500;
      const code = err.code || (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message || (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({ error: { code, message } });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.familyId as string;
      const eventId = req.params.eventId as string;
      const userId = req.user.id as string;

      const event = await eventService.getEventById(familyId, eventId, userId);

      return res.status(200).json({ data: event });
    } catch (err: any) {
      console.error('Get event error:', err);
      const status = err.status || 500;
      const code = err.code || (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message || (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({ error: { code, message } });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.familyId as string;
      const eventId = req.params.eventId as string;
      const userId = req.user.id as string;
      const { name, type, date, time, reminderDays, description, timeZone } = req.body;

      const input: UpdateEventInput = {
        familyId,
        userId,
        eventId,
        name,
        type,
        date,
        time,
        timeZone,
        reminderDays,
        description,
      };

      const event = await eventService.updateEvent(input);

      return res.status(200).json({
        message: 'Cập nhật sự kiện thành công',
        data: event,
      });
    } catch (err: any) {
      console.error('Update event error:', err);
      const status = err.status || 500;
      const code = err.code || (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message || (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({ error: { code, message } });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.familyId as string;
      const eventId = req.params.eventId as string;
      const userId = req.user.id as string;

      await eventService.deleteEvent(familyId, eventId, userId);

      return res.status(200).json({
        message: 'Xóa sự kiện thành công',
      });
    } catch (err: any) {
      console.error('Delete event error:', err);
      const status = err.status || 500;
      const code = err.code || (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message || (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({ error: { code, message } });
    }
  }
}

export default new EventController();
