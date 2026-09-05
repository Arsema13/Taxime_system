import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { PrismaClient } from '@prisma/client';
import { successResponse } from '../utils/responses';
import { ReportExportService } from '../services/report/report-export.service';

const prisma = new PrismaClient();
const exportService = new ReportExportService();

export class SubmittedReportController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        title, reportType, period, fromDate, toDate,
        summary, progress, timeSpent, blockers, achievements, nextSteps, taskId
      } = req.body;

      const report = await prisma.report.create({
        data: {
          title,
          reportType: reportType || 'TASK_REPORT',
          period: period || 'CUSTOM',
          fromDate: new Date(fromDate),
          toDate: new Date(toDate),
          summary,
          progress: progress || 0,
          timeSpent,
          blockers,
          achievements,
          nextSteps,
          authorId: userId,
          taskId: taskId || null,
          status: 'DRAFT'
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true } }
        }
      });

      res.status(201).json(successResponse('Report created', report));
    } catch (error) { next(error); }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const { status, reportType, period, fromDate, toDate, authorId, assignerId } = req.query as any;

      const where: any = {};

      if (role === 'MEMBER' || role === 'TEAM_LEAD') {
        where.authorId = userId;
      } else if (assignerId) {
        where.assignerId = assignerId;
      }

      if (status) where.status = status;
      if (reportType) where.reportType = reportType;
      if (period) where.period = period;
      if (authorId) where.authorId = authorId;
      if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) where.createdAt.gte = new Date(fromDate);
        if (toDate) where.createdAt.lte = new Date(toDate);
      }

      const reports = await prisma.report.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          assigner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json(successResponse('Reports fetched', reports));
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true } },
          assigner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true, status: true, priority: true, dueDate: true } }
        }
      });

      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      res.json(successResponse('Report fetched', report));
    } catch (error) { next(error); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;

      const existing = await prisma.report.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      if (existing.authorId !== userId && role !== 'COMMANDER') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const {
        title, summary, progress, timeSpent, blockers, achievements, nextSteps, reviewerComment
      } = req.body;

      const report = await prisma.report.update({
        where: { id },
        data: {
          title,
          summary,
          progress,
          timeSpent,
          blockers,
          achievements,
          nextSteps,
          reviewerComment
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          assigner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true } }
        }
      });

      res.json(successResponse('Report updated', report));
    } catch (error) { next(error); }
  }

  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const existing = await prisma.report.findUnique({
        where: { id },
        include: { task: { include: { creator: true } } }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      if (existing.authorId !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      if (existing.status !== 'DRAFT' && existing.status !== 'REVISION_NEEDED') {
        return res.status(400).json({ success: false, message: 'Report cannot be submitted' });
      }

      const assignerId = existing.task?.creatorId || null;

      const report = await prisma.report.update({
        where: { id },
        data: {
          status: 'SUBMITTED',
          submittedAt: new Date(),
          assignerId
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          assigner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true } }
        }
      });

      res.json(successResponse('Report submitted', report));
    } catch (error) { next(error); }
  }

  async review(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const role = req.user!.role;
      const { status, reviewerComment } = req.body;

      if (role !== 'COMMANDER' && role !== 'TEAM_LEAD') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const existing = await prisma.report.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      if (!['SUBMITTED', 'UNDER_REVIEW'].includes(existing.status)) {
        return res.status(400).json({ success: false, message: 'Report cannot be reviewed' });
      }

      const report = await prisma.report.update({
        where: { id },
        data: {
          status,
          reviewerComment,
          reviewedAt: new Date()
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          assigner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true } }
        }
      });

      res.json(successResponse('Report reviewed', report));
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const existing = await prisma.report.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      if (existing.authorId !== userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ success: false, message: 'Only draft reports can be deleted' });
      }

      await prisma.report.delete({ where: { id } });

      res.json(successResponse('Report deleted', null));
    } catch (error) { next(error); }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.user!.role;
      const userId = req.user!.id;

      const where: any = {};
      if (role === 'MEMBER' || role === 'TEAM_LEAD') {
        where.authorId = userId;
      }

      const [total, drafts, submitted, approved, rejected, revisionNeeded] = await Promise.all([
        prisma.report.count({ where }),
        prisma.report.count({ where: { ...where, status: 'DRAFT' } }),
        prisma.report.count({ where: { ...where, status: 'SUBMITTED' } }),
        prisma.report.count({ where: { ...where, status: 'APPROVED' } }),
        prisma.report.count({ where: { ...where, status: 'REJECTED' } }),
        prisma.report.count({ where: { ...where, status: 'REVISION_NEEDED' } })
      ]);

      res.json(successResponse('Stats fetched', {
        total, drafts, submitted, approved, rejected, revisionNeeded
      }));
    } catch (error) { next(error); }
  }

  async exportPdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
          assigner: { select: { id: true, firstName: true, lastName: true, email: true } },
          task: { select: { id: true, title: true, status: true, priority: true } }
        }
      });

      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      const reportData = {
        type: `Submitted Report - ${report.title}`,
        data: [{
          Title: report.title,
          Status: report.status,
          Type: report.reportType,
          Period: report.period,
          Progress: `${report.progress}%`,
          'Time Spent': report.timeSpent ? `${report.timeSpent}h` : 'N/A',
          Summary: report.summary,
          Achievements: report.achievements || 'N/A',
          Blockers: report.blockers || 'N/A',
          'Next Steps': report.nextSteps || 'N/A',
          Author: `${report.author.firstName} ${report.author.lastName}`,
          'Review Comments': report.reviewerComment || 'N/A'
        }]
      };

      const buffer = await exportService.exportToPDF(reportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=report-${id}.pdf`);
      res.send(buffer);
    } catch (error) { next(error); }
  }

  async exportExcel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
          assigner: { select: { id: true, firstName: true, lastName: true, email: true } },
          task: { select: { id: true, title: true, status: true, priority: true } }
        }
      });

      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      const reportData = {
        type: `Submitted Report - ${report.title}`,
        data: [{
          Title: report.title,
          Status: report.status,
          Type: report.reportType,
          Period: report.period,
          Progress: `${report.progress}%`,
          'Time Spent': report.timeSpent ? `${report.timeSpent}h` : 'N/A',
          Summary: report.summary,
          Achievements: report.achievements || 'N/A',
          Blockers: report.blockers || 'N/A',
          'Next Steps': report.nextSteps || 'N/A',
          Author: `${report.author.firstName} ${report.author.lastName}`,
          'Review Comments': report.reviewerComment || 'N/A'
        }]
      };

      const buffer = await exportService.exportToExcel(reportData);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=report-${id}.xlsx`);
      res.send(buffer);
    } catch (error) { next(error); }
  }
}

export const submittedReportController = new SubmittedReportController();
