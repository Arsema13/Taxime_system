import prisma from '../../config/database';
import { TaskPriority, RecurrenceType } from '@prisma/client';
import { notificationService } from '../notification.service';
import { activityService } from '../activity.service';
import { findTaskById } from './task-find-by-id.service';

export async function createTask(data: {
  title: string; description?: string; priority: string;
  dueDate?: string; startDate?: string; estimatedHours?: number;
  teamId?: string; creatorId: string;
  assigneeIds?: string[]; primaryAssigneeId?: string;
  tags?: string[];
  location?: string; vehicleReference?: string;
  customerReference?: string; externalRef?: string;
  isRecurring?: boolean; recurrenceType?: string; recurrenceEnd?: string;
}) {
  const { assigneeIds, primaryAssigneeId, tags, ...taskData } = data;

  const createInput: any = {
    title: taskData.title, description: taskData.description, status: 'DRAFT',
    priority: taskData.priority as TaskPriority,
    dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
    startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
    estimatedHours: taskData.estimatedHours, location: taskData.location,
    vehicleReference: taskData.vehicleReference, customerReference: taskData.customerReference,
    externalRef: taskData.externalRef, isRecurring: taskData.isRecurring || false,
    recurrenceType: taskData.recurrenceType as RecurrenceType | undefined,
    recurrenceEnd: taskData.recurrenceEnd ? new Date(taskData.recurrenceEnd) : undefined,
    creator: { connect: { id: data.creatorId } },
  };

  if (taskData.teamId) createInput.team = { connect: { id: taskData.teamId } };

  const task = await prisma.task.create({ data: createInput });

  // Filter out admin users from assignees
  let validAssigneeIds = assigneeIds || [];
  if (validAssigneeIds.length > 0) {
    const adminUsers = await prisma.user.findMany({
      where: { id: { in: validAssigneeIds }, role: 'ADMIN' },
      select: { id: true },
    });
    const adminIds = new Set(adminUsers.map(u => u.id));
    validAssigneeIds = validAssigneeIds.filter(id => !adminIds.has(id));
  }

  if (validAssigneeIds.length > 0) {
    for (const userId of validAssigneeIds) {
      await prisma.taskAssignee.create({ data: { taskId: task.id, userId, isPrimary: userId === primaryAssigneeId } });
    }
  }

  if (tags && tags.length > 0) {
    for (const tagName of tags) {
      const tag = await prisma.tag.upsert({ where: { name: tagName }, update: {}, create: { name: tagName } });
      await prisma.taskTag.create({ data: { taskId: task.id, tagId: tag.id } });
    }
  }

  if (validAssigneeIds.length > 0) {
    for (const userId of validAssigneeIds) {
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
