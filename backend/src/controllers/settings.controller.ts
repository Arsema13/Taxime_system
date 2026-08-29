import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { settingsService } from '../services/settings.service';
import { successResponse } from '../utils/responses';

export class SettingsController {
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
