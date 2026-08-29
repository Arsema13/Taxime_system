import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
import { authService } from '../../services/auth.service';
import { successResponse } from '../../utils/responses';

export class AuthSessionController {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];
      const result = await authService.login(email, password, ip, userAgent);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json(successResponse('Login successful', result));
    } catch (error) { next(error); }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessionId = req.query.sessionId as string | undefined;
      await authService.logout(req.user!.id, sessionId);
      res.clearCookie('refreshToken');
      res.json(successResponse('Logged out successfully'));
    } catch (error) { next(error); }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const token = req.body.token || req.cookies?.refreshToken;
      const result = await authService.refreshToken(token);
      res.json(successResponse('Token refreshed', result));
    } catch (error) { next(error); }
  }

  async getSessions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await authService.getSessions(req.user!.id);
      res.json(successResponse('Sessions', sessions));
    } catch (error) { next(error); }
  }

  async revokeSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await authService.revokeSession(req.user!.id, req.params.sessionId);
      res.json(successResponse('Session revoked'));
    } catch (error) { next(error); }
  }
}
