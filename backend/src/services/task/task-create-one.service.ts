import prisma from '../../config/database';
import { TaskPriority, TaskCategory, RecurrenceType } from '@prisma/client';
import { notificationService } from '../notification.service';
import { activityService } from '../activity.service';
import { findTaskById } from './task-find-by-id.service';

export async function createTask(data: {
  title: string; description?: string; priority?: string; category?: string;
  dueDate?: string; startDate?: string; estimatedHours?: number;
  departmentId?: string; teamId?: string; creatorId: string;
  assigneeIds?: string[]; primaryAssigneeId?: string;
  tags?: string[]; location?: string; vehicleReference?: string;
  customerReference?: string; externalRef?: string;
  isRecurring?: boolean; recurrenceType?: string; recurrenceEnd?: string;
}) {
  const { assigneeIds, primaryAssigneeId, tags, ...taskData } = data;

  const createInput: any = {
    title: taskData.title, description: taskData.description, status: 'DRAFT',
    priority: (taskData.priority as TaskPriority) || 'MEDIUM',
    category: (taskData.category as TaskCategory) || 'OTHER',
    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
    startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
    estimatedHours: taskData.estimatedHours, location: taskData.location,
    vehicleReference: taskData.vehicleReference, customerReference: taskData.customerReference,
    externalRef: taskData.externalRef, isRecurring: taskData.isRecurring || false,
    recurrenceType: taskData.recurrenceType as RecurrenceType | undefined,
    recurrenceEnd: taskData.recurrenceEnd ? new Date(taskData.recurrenceEnd) : undefined,
    creator: { connect: { id: data.creatorId } },
  };

  if (taskData.departmentId) createInput.department = { connect: { id: taskData.departmentId } };
  if (taskData.teamId) createInput.team = { connect: { id: taskData.teamId } };

  const task = await prisma.task.create({ data: createInput });

  if (assigneeIds && assigneeIds.length > 0) {
    for (const userId of assigneeIds) {
      await prisma.taskAssignee.create({ data: { taskId: task.id, userId, isPrimary: userId === primaryAssigneeId } });
    }
  }

  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } });
      await prisma.taskTag.create({ data: { taskId: task.id, tagId: tag.id } });
    }
  }

  if (assigneeIds) {
    for (const userId of assigneeIds) {
      if (userId !== data.creatorId) {
        await notificationService.create({
          userId, type: 'TASK_ASSIGNED', title: 'New Task Assigned',
          message: `You have been assigned to "${task.title}"`, taskId: task.id, actorId: data.creatorId,
        });
      }
    }
  }

  await activityService.log({ taskId: task.id, userId: data.creatorId, action: 'Task created', details: { title: task.title } });
  return findTaskById(task.id);
}
