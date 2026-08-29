import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { dashboardService } from '../services/dashboard';
import { successResponse } from '../utils/responses';

export class DashboardController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.user!.role;
      let data;
      if (role === 'COMMANDER') {
        data = await dashboardService.getCommanderDashboard();
      } else if (role === 'TEAM_LEAD') {
        data = await dashboardService.getTeamLeadDashboard(req.user!.id);
      } else {
        data = await dashboardService.getMemberDashboard(req.user!.id);
      }
      res.json(successResponse('Dashboard data', data));
    } catch (error) { next(error); }
  }
}

export const dashboardController = new DashboardController();
