import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { taskService } from '../../services/task.service';
import { successResponse } from '../../utils/responses';

export class TaskExtraController {
  async toggleFavorite(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.toggleFavorite(req.params.id, req.user!.id);
      res.json(successResponse('Favorite toggled', result));
    } catch (error) { next(error); }
  }

  async getWorkload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { teamId, departmentId } = req.query as any;
      const workload = await taskService.getWorkload(teamId, departmentId);
      res.json(successResponse('Workload', workload));
    } catch (error) { next(error); }
  }

  async getCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, departmentId, teamId, assigneeId } = req.query as any;
      const where: any = { isArchived: false };
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (departmentId) where.departmentId = departmentId;
      if (teamId) where.teamId = teamId;
      if (assigneeId) where.assignees = { some: { userId: assigneeId } };
      const count = await require('../../config/database').default.task.count({ where });
      res.json(successResponse('Task count', { count }));
    } catch (error) { next(error); }
  }
}
