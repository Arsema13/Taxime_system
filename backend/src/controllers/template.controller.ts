import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { templateService } from '../services/template.service';
import { successResponse } from '../utils/responses';

export class TemplateController {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const templates = await templateService.findAll(_req.user!.id);
      res.json(successResponse('Templates retrieved', templates));
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.findById(req.params.id);
      res.json(successResponse('Template retrieved', template));
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.create({ ...req.body, creatorId: req.user!.id });
      res.status(201).json(successResponse('Template created', template));
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const template = await templateService.update(req.params.id, req.body);
      res.json(successResponse('Template updated', template));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await templateService.delete(req.params.id);
      res.json(successResponse('Template deleted'));
    } catch (error) { next(error); }
  }
}

export const templateController = new TemplateController();
