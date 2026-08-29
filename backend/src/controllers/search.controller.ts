import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { searchService } from '../services/search.service';
import { successResponse } from '../utils/responses';

export class SearchController {
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query as { q: string };
      const results = await searchService.globalSearch(q, req.user!.id, req.user!.role);
      res.json(successResponse('Search results', results));
    } catch (error) { next(error); }
  }
}

export const searchController = new SearchController();
