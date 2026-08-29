import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { userService } from '../services/user.service';
import { successResponse } from '../utils/responses';

export class UserController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, role, status, departmentId, teamId, sortBy, sortOrder } = req.query as any;
      const result = await userService.findAll({
        page: parseInt(page) || 1, limit: parseInt(limit) || 20, search, role, status,
        departmentId, teamId, sortBy, sortOrder,
      });
      res.json(successResponse('Users retrieved', result));
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      res.json(successResponse('User retrieved', user));
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      res.status(201).json(successResponse('User created', user));
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.body);
      res.json(successResponse('User updated', user));
    } catch (error) { next(error); }
  }

  async deactivate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deactivate(req.params.id);
      res.json(successResponse('User deactivated'));
    } catch (error) { next(error); }
  }

  async activate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.activate(req.params.id);
      res.json(successResponse('User activated'));
    } catch (error) { next(error); }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getStats(req.params.id);
      res.json(successResponse('User stats', stats));
    } catch (error) { next(error); }
  }

  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateMe(req.user!.id, req.body);
      res.json(successResponse('Profile updated', user));
    } catch (error) { next(error); }
  }

  async getMyStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getStats(req.user!.id);
      res.json(successResponse('Your stats', stats));
    } catch (error) { next(error); }
  }
}

export const userController = new UserController();
