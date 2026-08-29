import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { timeTrackingService } from '../services/timeTracking.service';
import { successResponse } from '../utils/responses';

export class TimeTrackingController {
  async startTimer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await timeTrackingService.startTimer(req.params.taskId, req.user!.id, req.body.description);
      res.status(201).json(successResponse('Timer started', entry));
    } catch (error) { next(error); }
  }

  async stopTimer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await timeTrackingService.stopTimer(req.user!.id);
      res.json(successResponse('Timer stopped', entry));
    } catch (error) { next(error); }
  }

  async getRunningTimer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entry = await timeTrackingService.getRunningTimer(req.user!.id);
      res.json(successResponse('Running timer', entry));
    } catch (error) { next(error); }
  }

  async getEntriesByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const entries = await timeTrackingService.getEntriesByTask(req.params.taskId);
      res.json(successResponse('Time entries', entries));
    } catch (error) { next(error); }
  }

  async getEntriesByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo } = req.query as any;
      const result = await timeTrackingService.getEntriesByUser(req.params.userId || req.user!.id, dateFrom, dateTo);
      res.json(successResponse('Time entries', result));
    } catch (error) { next(error); }
  }

  async deleteEntry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await timeTrackingService.deleteEntry(req.params.id, req.user!.id);
      res.json(successResponse('Time entry deleted'));
    } catch (error) { next(error); }
  }
}

export const timeTrackingController = new TimeTrackingController();
