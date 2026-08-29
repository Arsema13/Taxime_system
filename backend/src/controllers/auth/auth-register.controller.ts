import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { authService } from '../../services/auth.service';
import { successResponse } from '../../utils/responses';

export class AuthRegisterController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json(successResponse('Registration successful', result));
    } catch (error) { next(error); }
  }

  async verifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyEmail(req.body.token);
      res.json(successResponse(result.message));
    } catch (error) { next(error); }
  }

  async resendVerification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.resendVerification(req.body.email);
      res.json(successResponse(result.message));
    } catch (error) { next(error); }
  }
}
