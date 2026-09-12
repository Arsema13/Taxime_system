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
      const { page, limit, userId, action, search, fromDate, toDate } = req.query as any;
      const take = parseInt(limit) || 50;
      const skip = ((parseInt(page) || 1) - 1) * take;

      const where: any = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (search) where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { task: { title: { contains: search, mode: 'insensitive' } } },
      ];
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate)   where.createdAt.lte = new Date(toDate);
      }

      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          where, skip, take,
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            task: { select: { id: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.activityLog.count({ where }),
      ]);

      res.json(successResponse('Activity logs', {
        data: logs,
        pagination: { total, page: parseInt(page) || 1, limit: take, totalPages: Math.ceil(total / take) },
      }));
    } catch (error) { next(error); }
  }

  async exportActivities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, action, search, fromDate, toDate } = req.query as any;
      const where: any = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (search) where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { task: { title: { contains: search, mode: 'insensitive' } } },
      ];
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate)   where.createdAt.lte = new Date(toDate);
      }

      const logs = await prisma.activityLog.findMany({
        where, take: 5000,
        include: {
          user: { select: { firstName: true, lastName: true } },
          task: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Build clean CSV
      const rows = [
        ['Date & Time', 'User', 'Action', 'Task', 'Details'],
        ...logs.map((l: any) => [
          new Date(l.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System',
          l.action.replace(/_/g, ' '),
          l.task?.title || '—',
          l.details ? Object.entries(l.details as object).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join('; ') : '—',
        ]),
      ];

      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="activity-log-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csv);
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
