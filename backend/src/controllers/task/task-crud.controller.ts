import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { taskService } from '../../services/task.service';
import { successResponse } from '../../utils/responses';

export class TaskCrudController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, priority, category, departmentId, teamId,
        assigneeId, creatorId, dueDateFrom, dueDateTo, isArchived, tags,
        sortBy, sortOrder } = req.query as any;
      const result = await taskService.findAll({
        page: parseInt(page) || 1, limit: parseInt(limit) || 20, search, status, priority,
        category, departmentId, teamId, assigneeId, creatorId, dueDateFrom, dueDateTo,
        isArchived, tags, sortBy, sortOrder,
        userId: req.user!.id, userRole: req.user!.role,
      });
      res.json(successResponse('Tasks retrieved', result));
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.findById(req.params.id);
      res.json(successResponse('Task retrieved', task));
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create({ ...req.body, creatorId: req.user!.id });
      res.status(201).json(successResponse('Task created', task));
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(req.params.id, req.user!.id, req.user!.role, req.body);
      res.json(successResponse('Task updated', task));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id, req.user!.id);
      res.json(successResponse('Task deleted'));
    } catch (error) { next(error); }
  }
}
