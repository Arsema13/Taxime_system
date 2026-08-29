import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { TaskStatus } from '@prisma/client';
import { notificationService } from '../notification.service';
import { activityService } from '../activity.service';
import { findTaskById } from './task-query.service';
import { changeTaskStatus } from './task-status.service';
import { updateTask, deleteTask } from './task-update.service';

export async function assignTask(taskId: string, assigneeIds: string[], primaryAssigneeId?: string, assignedBy?: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');

  await prisma.taskAssignee.deleteMany({ where: { taskId } });
  for (const userId of assigneeIds) {
    await prisma.taskAssignee.create({
      data: { taskId, userId, isPrimary: userId === primaryAssigneeId },
    });
  }

  if (task.status === 'DRAFT' || task.status === 'PENDING') {
    await prisma.task.update({ where: { id: taskId }, data: { status: 'PENDING' } });
  }

  for (const userId of assigneeIds) {
    if (userId !== assignedBy) {
      await notificationService.create({
        userId, type: 'TASK_ASSIGNED', title: 'Task Assigned',
        message: `You have been assigned to "${task.title}"`,
        taskId, actorId: assignedBy,
      });
    }
  }

  await activityService.log({ taskId, userId: assignedBy!, action: 'Task assigned', details: { assigneeIds, primaryAssigneeId } });
  return findTaskById(taskId);
}

export async function bulkUpdateTasks(taskIds: string[], action: string, data: Record<string, any>, userId: string) {
  const results: any[] = [];

  for (const taskId of taskIds) {
    try {
      switch (action) {
        case 'assign':
          if (data.assigneeIds) await assignTask(taskId, data.assigneeIds, data.primaryAssigneeId, userId);
          break;
        case 'status':
          if (data.status) await changeTaskStatus(taskId, data.status, userId);
          break;
        case 'priority':
          if (data.priority) await updateTask(taskId, userId, 'COMMANDER', { priority: data.priority });
          break;
        case 'archive':
          await updateTask(taskId, userId, 'COMMANDER', { isArchived: true });
          break;
        case 'unarchive':
          await updateTask(taskId, userId, 'COMMANDER', { isArchived: false });
          break;
        case 'delete':
          await deleteTask(taskId, userId);
          break;
        default:
          throw new BadRequestError(`Unknown bulk action: ${action}`);
      }
      results.push({ taskId, success: true });
    } catch (error: any) {
      results.push({ taskId, success: false, error: error.message });
    }
  }

  await activityService.log({
    taskId: taskIds[0], userId,
    action: `Bulk ${action} on ${taskIds.length} tasks`,
    details: { taskIds, action, results },
  });

  return { processed: results.length, results };
}
