import prisma from '../config/database';
import { TaskStatus } from '@prisma/client';
import { notificationService } from '../services/notification.service';
import { emailService } from '../services/email.service';
import { socketService } from '../services/socket.service';

export class DeadlineReminderJob {
  async sendDeadlineReminders() {
    const now = new Date();
    const reminderDays = [3, 1, 0];

    for (const days of reminderDays) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + days);
      targetDate.setHours(0, 0, 0, 0);

      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const tasks = await prisma.task.findMany({
        where: {
          status: {
            in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS'] as TaskStatus[],
          },
          dueDate: { gte: targetDate, lt: nextDay },
          isArchived: false,
        },
        include: {
          assignees: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      });

      for (const task of tasks) {
        for (const assignee of task.assignees) {
          const reminderKey = `reminder_${task.id}_${assignee.userId}_${days}d`;
          const existing = await prisma.notification.findFirst({
            where: {
              userId: assignee.userId,
              taskId: task.id,
              title: 'Deadline Reminder',
            },
          });

          if (existing) continue;

          const dueLabel = days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
          await notificationService.create({
            userId: assignee.userId,
            type: 'DEADLINE_REMINDER',
            title: 'Deadline Reminder',
            message: `Task "${task.title}" is due ${dueLabel}`,
            taskId: task.id,
          });

          socketService.notifyUser(assignee.userId, 'notification', {
            type: 'DEADLINE_REMINDER',
            message: `Task "${task.title}" is due ${dueLabel}`,
          });

          if (assignee.user.email) {
            await emailService.sendDeadlineReminder(
              assignee.user.email,
              task.title,
              task.dueDate!,
            );
          }
        }
      }
    }
  }
}

export const deadlineReminderJob = new DeadlineReminderJob();
