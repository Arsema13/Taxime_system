import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { activityService } from '../services/activity.service';
import { successResponse } from '../utils/responses';
import prisma from '../config/database';

export class ActivityController {
  async getByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await activityService.findByTask(req.params.taskId, limit);
      res.json(successResponse('Activity logs retrieved', logs));
    } catch (error) { next(error); }
  }

  async getRecentActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const logs = await prisma.activityLog.findMany({
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      res.json(successResponse('Recent activity', logs));
    } catch (error) { next(error); }
  }

  async getAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, userId, action, entity, dateFrom, dateTo } = req.query as any;
      const result = await activityService.getAuditLogs({
        page: parseInt(page) || 1, limit: parseInt(limit) || 50,
        userId, action, entity, dateFrom, dateTo,
      });
      res.json(successResponse('Audit logs retrieved', result));
    } catch (error) { next(error); }
  }
}

export const activityController = new ActivityController();
