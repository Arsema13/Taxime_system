import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { savedFilterService } from '../services/savedFilter.service';
import { successResponse } from '../utils/responses';

export class SavedFilterController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = await savedFilterService.findAll(req.user!.id);
      res.json(successResponse('Saved filters retrieved', filters));
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filter = await savedFilterService.create(req.user!.id, req.body.name, req.body.filters);
      res.status(201).json(successResponse('Filter saved', filter));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await savedFilterService.delete(req.params.id, req.user!.id);
      res.json(successResponse('Filter deleted'));
    } catch (error) { next(error); }
  }
}

export const savedFilterController = new SavedFilterController();
