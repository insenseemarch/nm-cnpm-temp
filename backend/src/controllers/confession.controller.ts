import { Request, Response } from 'express';
import { ConfessionService } from '../services/confession.service';

const service = new ConfessionService();

export class ConfessionController {
  async create(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.id as string;        // <-- assert string
      const userId = req.user.id as string;            // <-- assert string
      const { content, isAnonymous } = req.body;

      const data = await service.createConfession({
        familyId,
        authorId: userId,
        content,
        isAnonymous,
      });

      return res.status(201).json({
        message: 'Tạo tâm sự thành công',
        data,
      });
    } catch (err: any) {
      console.error('Create confession error:', err);
      const status = err.status || 500;
      const code =
        err.code ||
        (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message ||
        (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({
        error: { code, message },
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.id as string;        // <-- assert string
      const userId = req.user.id as string;            // <-- assert string
      const display = (req.query.display as string) || 'all';
      const sortParam = (req.query.sort as string) || 'desc';
      const sort = sortParam === 'asc' ? 'asc' : 'desc';
      const page = parseInt(req.query.page as string, 10);
      const limit = parseInt(req.query.limit as string, 10);

      const result = await service.listConfessions({
        familyId,
        userId,
        display:
          display === 'anonymous' || display === 'public'
            ? (display as any)
            : 'all',
        sort,
        page,
        limit,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('List confessions error:', err);
      const status = err.status || 500;
      const code =
        err.code ||
        (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message ||
        (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({
        error: { code, message },
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.id as string;              // <-- assert string
      const confessionId = req.params.confessionId as string; // <-- assert string
      const userId = req.user.id as string;                  // <-- assert string

      const data = await service.getConfessionById(
        familyId,
        confessionId,
        userId,
      );

      return res.status(200).json({ data });
    } catch (err: any) {
      console.error('Get confession error:', err);
      const status = err.status || 500;
      const code =
        err.code ||
        (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message ||
        (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({
        error: { code, message },
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.id as string;              // <-- assert string
      const confessionId = req.params.confessionId as string; // <-- assert string
      const userId = req.user.id as string;                  // <-- assert string

      await service.deleteConfession(familyId, confessionId, userId);

      return res.status(200).json({
        message: 'Xóa tâm sự thành công',
      });
    } catch (err: any) {
      console.error('Delete confession error:', err);
      const status = err.status || 500;
      const code =
        err.code ||
        (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message ||
        (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({
        error: { code, message },
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Không được phép' },
        });
      }

      const familyId = req.params.id as string;
      const confessionId = req.params.confessionId as string;
      const userId = req.user.id as string;
      const { content, isAnonymous } = req.body;

      const data = await service.updateConfession(familyId, confessionId, userId, {
        content,
        isAnonymous,
      });

      return res.status(200).json({
        message: 'Cập nhật tâm sự thành công',
        data,
      });
    } catch (err: any) {
      console.error('Update confession error:', err);
      const status = err.status || 500;
      const code =
        err.code ||
        (status === 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      const message =
        err.message ||
        (status === 500 ? 'Lỗi hệ thống' : 'Dữ liệu không hợp lệ');

      return res.status(status).json({
        error: { code, message },
      });
    }
  }
}
