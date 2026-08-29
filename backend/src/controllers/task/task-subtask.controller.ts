import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { taskService } from '../../services/task.service';
import { successResponse } from '../../utils/responses';

export class TaskSubtaskController {
  async addSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subtask = await taskService.addSubtask(req.params.id, req.body, req.user!.id);
      res.status(201).json(successResponse('Subtask added', subtask));
    } catch (error) { next(error); }
  }

  async toggleSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subtask = await taskService.toggleSubtask(req.params.subtaskId, req.user!.id);
      res.json(successResponse('Subtask updated', subtask));
    } catch (error) { next(error); }
  }
}
