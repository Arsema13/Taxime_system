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
      const { status, reportType, period, fromDate, toDate, authorId, assignerId, teamId } = req.query as any;

      const where: any = {};

      if (role === 'MEMBER') {
        where.authorId = userId;
      } else if (role === 'TEAM_LEAD') {
        const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { teamId: true } });
        if (currentUser?.teamId) {
          where.OR = [
            { authorId: userId },
            { author: { teamId: currentUser.teamId } },
            { assignerId: userId }
          ];
        } else {
          where.authorId = userId;
        }
      } else if (assignerId) {
        where.assignerId = assignerId;
      }

      if (teamId && role === 'ADMIN') {
        where.author = { teamId: String(teamId) };
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
          author: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true, teamId: true } },
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
          author: { select: { id: true, firstName: true, lastName: true, avatar: true, email: true, teamId: true } },
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

      const existing = await prisma.report.findUnique({
        where: { id },
        include: { author: { select: { id: true, teamId: true } } }
      });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { teamId: true } });
      const isTeamLeadOfAuthor = role === 'TEAM_LEAD' && existing.author?.teamId && currentUser?.teamId && existing.author.teamId === currentUser.teamId;

      if (existing.authorId !== userId && role !== 'ADMIN' && !isTeamLeadOfAuthor) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const {
        title, summary, progress, timeSpent, blockers, achievements, nextSteps, reviewerComment, status
      } = req.body;

      const updateData: any = {
        ...(title !== undefined && { title }),
        ...(summary !== undefined && { summary }),
        ...(progress !== undefined && { progress }),
        ...(timeSpent !== undefined && { timeSpent }),
        ...(blockers !== undefined && { blockers }),
        ...(achievements !== undefined && { achievements }),
        ...(nextSteps !== undefined && { nextSteps }),
        ...(reviewerComment !== undefined && { reviewerComment }),
        ...(status !== undefined && { status })
      };

      const report = await prisma.report.update({
        where: { id },
        data: updateData,
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

      if (role !== 'ADMIN' && role !== 'TEAM_LEAD') {
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
      if (role === 'MEMBER') {
        where.authorId = userId;
      } else if (role === 'TEAM_LEAD') {
        const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { teamId: true } });
        if (currentUser?.teamId) {
          where.OR = [
            { authorId: userId },
            { author: { teamId: currentUser.teamId } },
            { assignerId: userId }
          ];
        } else {
          where.authorId = userId;
        }
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

  async combine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const {
        reportIds,
        title,
        summary,
        progress,
        timeSpent,
        blockers,
        achievements,
        nextSteps,
        period,
        reportType,
        sendToAdmin,
        reviewerComment
      } = req.body;

      if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
        return res.status(400).json({ success: false, message: 'reportIds must be a non-empty array' });
      }

      const sourceReports = await prisma.report.findMany({
        where: { id: { in: reportIds } },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'asc' }
      });

      if (sourceReports.length === 0) {
        return res.status(404).json({ success: false, message: 'None of the specified reports were found' });
      }

      const totalTime = sourceReports.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
      const avgProgress = Math.round(sourceReports.reduce((sum, r) => sum + (r.progress || 0), 0) / sourceReports.length);
      const earliestFrom = sourceReports.reduce((min, r) => r.fromDate < min ? r.fromDate : min, sourceReports[0].fromDate);
      const latestTo = sourceReports.reduce((max, r) => r.toDate > max ? r.toDate : max, sourceReports[0].toDate);

      const defaultTitle = `Consolidated Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

      const defaultSummary = summary || sourceReports
        .map(r => `[${r.author.firstName} ${r.author.lastName}]: ${r.summary}`)
        .join('\n\n');

      const defaultAchievements = achievements || sourceReports
        .filter(r => r.achievements)
        .map(r => `[${r.author.firstName} ${r.author.lastName}]: ${r.achievements}`)
        .join('\n');

      const defaultBlockers = blockers || sourceReports
        .filter(r => r.blockers)
        .map(r => `[${r.author.firstName} ${r.author.lastName}]: ${r.blockers}`)
        .join('\n');

      const defaultNextSteps = nextSteps || sourceReports
        .filter(r => r.nextSteps)
        .map(r => `[${r.author.firstName} ${r.author.lastName}]: ${r.nextSteps}`)
        .join('\n');

      let assignerId: string | null = null;
      if (sendToAdmin) {
        const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
        assignerId = adminUser?.id || null;
      }

      const combinedReport = await prisma.report.create({
        data: {
          title: title || defaultTitle,
          reportType: reportType || 'WEEKLY_REPORT',
          period: period || 'WEEKLY',
          fromDate: earliestFrom,
          toDate: latestTo,
          summary: defaultSummary,
          progress: progress !== undefined ? progress : avgProgress,
          timeSpent: timeSpent !== undefined ? timeSpent : totalTime,
          blockers: defaultBlockers || null,
          achievements: defaultAchievements || null,
          nextSteps: defaultNextSteps || null,
          reviewerComment: reviewerComment || null,
          authorId: userId,
          assignerId,
          status: sendToAdmin ? 'SUBMITTED' : 'DRAFT',
          submittedAt: sendToAdmin ? new Date() : null,
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          assigner: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          task: { select: { id: true, title: true } }
        }
      });

      if (sendToAdmin) {
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'GENERAL',
              title: 'Consolidated Team Report Submitted',
              message: `${req.user!.firstName} ${req.user!.lastName} submitted a consolidated report: "${combinedReport.title}"`,
              link: `/reports/${combinedReport.id}`
            }
          }).catch(() => {});
        }
      }

      res.status(201).json(successResponse('Combined report created successfully', combinedReport));
    } catch (error) { next(error); }
  }

  async exportCombinedWord(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reportIds, title, summary, notes } = req.body;

      if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
        return res.status(400).json({ success: false, message: 'reportIds must be provided as an array' });
      }

      const reports = await prisma.report.findMany({
        where: { id: { in: reportIds } },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, email: true } },
          task: { select: { id: true, title: true } }
        },
        orderBy: { createdAt: 'asc' }
      });

      const buffer = await exportService.exportCombinedReportsToWord(
        title || 'Consolidated Operations Report',
        reports,
        summary,
        notes
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=consolidated-report-${Date.now()}.docx`);
      res.send(buffer);
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

  async exportWord(req: AuthRequest, res: Response, next: NextFunction) {
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

      const buffer = await exportService.exportSubmittedReportToWord(report);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename=report-${id}.docx`);
      res.send(buffer);
    } catch (error) { next(error); }
  }
}

export const submittedReportController = new SubmittedReportController();
