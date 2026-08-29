import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { reportService } from '../services/report.service';
import { successResponse } from '../utils/responses';

export class ReportController {
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, format, ...query } = req.query as any;
      let reportData;

      switch (type) {
        case 'task_summary': reportData = await reportService.generateTaskSummary(query); break;
        case 'employee_performance': reportData = await reportService.generateEmployeePerformance(query); break;
        case 'team_performance': reportData = await reportService.generateTeamPerformance(query); break;
        case 'department_report': reportData = await reportService.generateDepartmentReport(query); break;
        case 'overdue_report': reportData = await reportService.generateOverdueReport(query); break;
        case 'task_history': reportData = await reportService.generateTaskHistory(query); break;
        case 'completion_timeline': reportData = await reportService.generateCompletionTimeline(query); break;
        default: return res.status(400).json({ success: false, message: 'Invalid report type' });
      }

      if (format === 'excel') {
        const buffer = await reportService.exportToExcel(reportData);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_report.xlsx`);
        res.send(buffer);
        return;
      }

      if (format === 'pdf') {
        const buffer = await reportService.exportToPDF(reportData);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${type}_report.pdf`);
        res.send(buffer);
        return;
      }

      res.json(successResponse('Report generated', reportData));
    } catch (error) { next(error); }
  }
}

export const reportController = new ReportController();
