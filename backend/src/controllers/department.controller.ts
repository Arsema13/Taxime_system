import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { departmentService } from '../services/department.service';
import { successResponse } from '../utils/responses';

export class DepartmentController {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const departments = await departmentService.findAll();
      res.json(successResponse('Departments retrieved', departments));
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dept = await departmentService.findById(req.params.id);
      res.json(successResponse('Department retrieved', dept));
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dept = await departmentService.create(req.body, req.user!.id);
      res.status(201).json(successResponse('Department created', dept));
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const dept = await departmentService.update(req.params.id, req.body, req.user!.id);
      res.json(successResponse('Department updated', dept));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await departmentService.delete(req.params.id, req.user!.id);
      res.json(successResponse('Department deleted'));
    } catch (error) { next(error); }
  }
}

export const departmentController = new DepartmentController();
