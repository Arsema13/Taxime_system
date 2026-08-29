import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { TaskStatus } from '@prisma/client';
import { notificationService } from '../notification.service';
import { activityService } from '../activity.service';
import { findTaskById } from './task-query.service';

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['PENDING', 'CANCELLED'],
  PENDING: ['ACCEPTED', 'IN_PROGRESS', 'CANCELLED'],
  ACCEPTED: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED_FOR_REVIEW', 'ON_HOLD', 'CANCELLED'],
  SUBMITTED_FOR_REVIEW: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['COMPLETED', 'REJECTED'],
  REJECTED: ['IN_PROGRESS', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
};

export async function changeTaskStatus(taskId: string, newStatus: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');

  if (!VALID_TRANSITIONS[task.status]?.includes(newStatus)) {
    throw new BadRequestError(`Cannot transition from ${task.status} to ${newStatus}`);
  }

  const updateData: any = { status: newStatus as TaskStatus };
  if (newStatus === 'COMPLETED') {
    updateData.completedAt = new Date();
    updateData.progress = 100;
  }

  await prisma.task.update({ where: { id: taskId }, data: updateData });

  if (newStatus === 'COMPLETED') {
    const assignees = await prisma.taskAssignee.findMany({ where: { taskId } });
    for (const a of assignees) {
      if (a.userId !== userId) {
        await notificationService.create({
          userId: a.userId, type: 'TASK_COMPLETED', title: 'Task Completed',
          message: `"${task.title}" has been completed`, taskId, actorId: userId,
        });
      }
    }
  }

  await activityService.log({
    taskId, userId,
    action: `Status changed to ${newStatus}`,
    details: { from: task.status, to: newStatus },
  });

  return findTaskById(taskId);
}
