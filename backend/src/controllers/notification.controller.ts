import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { notificationService } from '../services/notification.service';
import { successResponse } from '../utils/responses';

export class NotificationController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await notificationService.findByUser(req.user!.id, unreadOnly);
      res.json(successResponse('Notifications retrieved', notifications));
    } catch (error) { next(error); }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.id);
      res.json(successResponse('Notification marked as read'));
    } catch (error) { next(error); }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.json(successResponse('All notifications marked as read'));
    } catch (error) { next(error); }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getUnreadCount(req.user!.id);
      res.json(successResponse('Unread count', result));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.delete(req.params.id, req.user!.id);
      res.json(successResponse('Notification deleted'));
    } catch (error) { next(error); }
  }

  async getPreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await notificationService.getPreferences(req.user!.id);
      res.json(successResponse('Notification preferences', prefs));
    } catch (error) { next(error); }
  }

  async updatePreferences(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prefs = await notificationService.updatePreferences(req.user!.id, req.body);
      res.json(successResponse('Notification preferences updated', prefs));
    } catch (error) { next(error); }
  }
}

export const notificationController = new NotificationController();
