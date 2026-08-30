import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { settingsService } from '../services/settings.service';
import { successResponse } from '../utils/responses';

export class SettingsController {
  // User settings endpoints
  async getUserSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const settings = await settingsService.getUserSettings(userId);
      res.json(successResponse('Settings retrieved', settings));
    } catch (error) { next(error); }
  }

  async updateUserSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const settings = await settingsService.updateUserSettings(userId, req.body);
      res.json(successResponse('Settings updated', settings));
    } catch (error) { next(error); }
  }

  // System settings endpoints (admin only)
  async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getAll();
      res.json(successResponse('Settings retrieved', settings));
    } catch (error) { next(error); }
  }

  async set(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      const setting = await settingsService.set(key, value);
      res.json(successResponse('Setting updated', setting));
    } catch (error) { next(error); }
  }

  async setMultiple(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await settingsService.setMultiple(req.body);
      res.json(successResponse('Settings updated'));
    } catch (error) { next(error); }
  }
}

export const settingsController = new SettingsController();
