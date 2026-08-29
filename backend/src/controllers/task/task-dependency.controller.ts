import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { taskService } from '../../services/task.service';
import { successResponse } from '../../utils/responses';

export class TaskDependencyController {
  async addDependency(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dep = await taskService.addDependency(req.params.id, req.body.dependsOnId, req.user!.id);
      res.status(201).json(successResponse('Dependency added', dep));
    } catch (error) { next(error); }
  }

  async removeDependency(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await taskService.removeDependency(req.params.id, req.params.dependsOnId);
      res.json(successResponse('Dependency removed'));
    } catch (error) { next(error); }
  }
}
