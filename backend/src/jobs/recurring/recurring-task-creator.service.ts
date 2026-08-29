import prisma from '../../config/database';
import { TaskStatus } from '@prisma/client';
import { notificationService } from '../../services/notification.service';
import { activityService } from '../../services/activity.service';
import { socketService } from '../../services/socket.service';

export class RecurringTaskCreatorService {
  async createNextTask(task: any, nextDueDate: Date) {
    const newTask = await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        status: 'PENDING' as TaskStatus,
        priority: task.priority,
        category: task.category,
        dueDate: nextDueDate,
        estimatedHours: task.estimatedHours,
        location: task.location,
        vehicleReference: task.vehicleReference,
        customerReference: task.customerReference,
        externalRef: task.externalRef,
        isRecurring: true,
        recurrenceType: task.recurrenceType,
        recurrenceEnd: task.recurrenceEnd,
        creatorId: task.creatorId,
        departmentId: task.departmentId,
        teamId: task.teamId,
        templateId: task.templateId,
      },
    });

    for (const assignee of task.assignees) {
      await prisma.taskAssignee.create({
        data: {
          taskId: newTask.id,
          userId: assignee.userId,
          isPrimary: assignee.isPrimary,
        },
      });
    }

    for (const tag of task.tags) {
      await prisma.taskTag.create({
        data: { taskId: newTask.id, tagId: tag.tagId },
      });
    }

    return newTask;
  }

  async logAndNotify(newTask: any, task: any, nextDueDate: Date) {
    await activityService.log({
      taskId: newTask.id,
      userId: task.creatorId,
      action: 'Recurring task generated',
      details: { fromTaskId: task.id, dueDate: nextDueDate },
    });

    for (const assignee of task.assignees) {
      if (assignee.userId !== task.creatorId) {
        await notificationService.create({
          userId: assignee.userId,
          type: 'TASK_ASSIGNED',
          title: 'Recurring Task Assigned',
          message: `Recurring task "${task.title}" has been created and assigned to you`,
          taskId: newTask.id,
          actorId: task.creatorId,
        });
        socketService.notifyUser(assignee.userId, 'notification', {
          type: 'TASK_ASSIGNED',
          message: `Recurring task "${task.title}" assigned to you`,
        });
      }
    }
  }
}

export const recurringTaskCreatorService = new RecurringTaskCreatorService();
