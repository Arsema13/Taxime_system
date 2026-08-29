import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { authService } from '../../services/auth.service';
import { successResponse } from '../../utils/responses';
import { userService } from '../../services/user.service';

export class AuthPasswordController {
  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      res.json(successResponse(result.message, result));
    } catch (error) { next(error); }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.password);
      res.json(successResponse(result.message));
    } catch (error) { next(error); }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
      res.json(successResponse(result.message));
    } catch (error) { next(error); }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.user!.id);
      res.json(successResponse('User profile', user));
    } catch (error) { next(error); }
  }
}
