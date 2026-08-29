import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { taskService } from '../../services/task.service';
import { successResponse } from '../../utils/responses';

export class TaskStatusController {
  async changeStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.changeStatus(req.params.id, req.body.status, req.user!.id);
      res.json(successResponse('Status updated', task));
    } catch (error) { next(error); }
  }

  async acceptTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.changeStatus(req.params.id, 'ACCEPTED', req.user!.id);
      res.json(successResponse('Task accepted', task));
    } catch (error) { next(error); }
  }

  async startTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.changeStatus(req.params.id, 'IN_PROGRESS', req.user!.id);
      res.json(successResponse('Task started', task));
    } catch (error) { next(error); }
  }

  async submitForReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.changeStatus(req.params.id, 'SUBMITTED_FOR_REVIEW', req.user!.id);
      res.json(successResponse('Task submitted for review', task));
    } catch (error) { next(error); }
  }

  async approveTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.changeStatus(req.params.id, 'COMPLETED', req.user!.id);
      res.json(successResponse('Task approved', task));
    } catch (error) { next(error); }
  }

  async rejectTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.changeStatus(req.params.id, 'REJECTED', req.user!.id);
      res.json(successResponse('Task rejected', task));
    } catch (error) { next(error); }
  }
}
