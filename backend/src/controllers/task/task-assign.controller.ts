import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { taskService } from '../../services/task.service';
import { successResponse } from '../../utils/responses';

export class TaskAssignController {
  async assign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.assign(req.params.id, req.body.assigneeIds, req.body.primaryAssigneeId, req.user!.id);
      res.json(successResponse('Task assigned', task));
    } catch (error) { next(error); }
  }

  async bulkUpdate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { taskIds, action, data } = req.body;
      const result = await taskService.bulkUpdate(taskIds, action, data || {}, req.user!.id);
      res.json(successResponse('Bulk operation completed', result));
    } catch (error) { next(error); }
  }

  async createFromTemplate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { templateId, ...overrides } = req.body;
      const task = await taskService.createFromTemplate(templateId, req.user!.id, overrides);
      res.status(201).json(successResponse('Task created from template', task));
    } catch (error) { next(error); }
  }
}
