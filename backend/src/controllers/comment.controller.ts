import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { commentService } from '../services/comment.service';
import { successResponse } from '../utils/responses';

export class CommentController {
  async getByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.findByTask(req.params.taskId);
      res.json(successResponse('Comments retrieved', comments));
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.create({
        taskId: req.params.taskId, authorId: req.user!.id, ...req.body,
      });
      res.status(201).json(successResponse('Comment added', comment));
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.update(req.params.id, req.user!.id, req.body.content);
      res.json(successResponse('Comment updated', comment));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await commentService.delete(req.params.id, req.user!.id, req.user!.role);
      res.json(successResponse('Comment deleted'));
    } catch (error) { next(error); }
  }
}

export const commentController = new CommentController();
