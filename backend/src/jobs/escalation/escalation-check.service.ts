import prisma from '../../config/database';
import { TaskStatus } from '@prisma/client';
import { activityService } from '../../services/activity.service';
import { escalationNotifyService } from './escalation-notify.service';

export class EscalationCheckService {
  async escalateOverdueTasks() {
    const now = new Date();
    const escalationThresholds = [
      { hours: 24, notify: 'TEAM_LEAD' },
      { hours: 48, notify: 'COMMANDER' },
    ];

    for (const threshold of escalationThresholds) {
      const cutoff = new Date(now.getTime() - threshold.hours * 60 * 60 * 1000);

      const tasks = await prisma.task.findMany({
        where: {
          status: 'OVERDUE' as TaskStatus,
          dueDate: { lt: cutoff },
          isArchived: false,
        },
        include: {
          assignees: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
          team: {
            include: {
              members: {
                where: { role: threshold.notify as any },
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
          department: {
            include: {
              users: {
                where: { role: 'COMMANDER' as any },
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      });

      for (const task of tasks) {
        const existingEscalation = await prisma.activityLog.findFirst({
          where: {
            taskId: task.id,
            action: `Escalated to ${threshold.notify}`,
          },
        });

        if (existingEscalation) continue;

        let notifyTargets: any[] = [];

        if (threshold.notify === 'TEAM_LEAD' && task.team) {
          notifyTargets = task.team.members;
        } else if (threshold.notify === 'COMMANDER') {
          notifyTargets = task.department?.users || [];
        }

        if (notifyTargets.length === 0) continue;

        await activityService.log({
          taskId: task.id,
          userId: 'system',
          action: `Escalated to ${threshold.notify}`,
          details: {
            overdueHours: threshold.hours,
            notifyTarget: threshold.notify,
            targets: notifyTargets.map((t: any) => t.id),
          },
        });

        await escalationNotifyService.sendEscalationNotifications(
          notifyTargets,
          { id: task.id, title: task.title },
          threshold.hours,
        );
      }
    }
  }
}

export const escalationCheckService = new EscalationCheckService();
