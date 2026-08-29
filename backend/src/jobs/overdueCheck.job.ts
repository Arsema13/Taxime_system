import prisma from '../config/database';
import { TaskStatus } from '@prisma/client';
import { notificationService } from '../services/notification.service';
import { activityService } from '../services/activity.service';
import { socketService } from '../services/socket.service';

export class OverdueCheckJob {
  async checkOverdueTasks() {
    const now = new Date();

    const overdueTasks = await prisma.task.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'ON_HOLD'] as TaskStatus[],
        },
        dueDate: { lt: now },
        isArchived: false,
      },
      include: {
        assignees: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
        },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    for (const task of overdueTasks) {
      await prisma.task.update({
        where: { id: task.id },
        data: { status: 'OVERDUE' as TaskStatus },
      });

      await activityService.log({
        taskId: task.id,
        userId: 'system',
        action: 'Task automatically marked as overdue',
        details: { dueDate: task.dueDate, previousStatus: task.status },
      });

      for (const assignee of task.assignees) {
        await notificationService.create({
          userId: assignee.userId,
          type: 'TASK_OVERDUE',
          title: 'Task Overdue',
          message: `Task "${task.title}" is now overdue`,
          taskId: task.id,
        });
        socketService.notifyUser(assignee.userId, 'notification', {
          type: 'TASK_OVERDUE',
          message: `Task "${task.title}" is overdue`,
        });
      }

      if (task.creator && !task.assignees.some((a) => a.userId === task.creator.id)) {
        await notificationService.create({
          userId: task.creator.id,
          type: 'TASK_OVERDUE',
          title: 'Task Overdue',
          message: `Task "${task.title}" assigned to ${task.assignees.map((a) => `${a.user.firstName} ${a.user.lastName}`).join(', ')} is now overdue`,
          taskId: task.id,
        });
      }
    }

    return overdueTasks.length;
  }
}

export const overdueCheckJob = new OverdueCheckJob();
