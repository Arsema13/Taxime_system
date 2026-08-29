import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { teamService } from '../services/team.service';
import { successResponse } from '../utils/responses';

export class TeamController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, departmentId, search } = req.query as any;
      const result = await teamService.findAll({ page: parseInt(page) || 1, limit: parseInt(limit) || 20, departmentId, search });
      res.json(successResponse('Teams retrieved', result));
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const team = await teamService.findById(req.params.id);
      res.json(successResponse('Team retrieved', team));
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const team = await teamService.create(req.body, req.user!.id);
      res.status(201).json(successResponse('Team created', team));
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const team = await teamService.update(req.params.id, req.body, req.user!.id);
      res.json(successResponse('Team updated', team));
    } catch (error) { next(error); }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const team = await teamService.addMember(req.params.id, req.body.userId, req.user!.id);
      res.json(successResponse('Member added to team', team));
    } catch (error) { next(error); }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const team = await teamService.removeMember(req.params.id, req.params.userId, req.user!.id);
      res.json(successResponse('Member removed from team', team));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await teamService.delete(req.params.id, req.user!.id);
      res.json(successResponse('Team deleted'));
    } catch (error) { next(error); }
  }
}

export const teamController = new TeamController();
