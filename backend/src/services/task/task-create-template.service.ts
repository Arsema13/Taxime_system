import prisma from '../../config/database';
import { notificationService } from '../notification.service';
import { activityService } from '../activity.service';
import { findTaskById } from './task-find-by-id.service';

export async function createTaskFromTemplate(templateId: string, creatorId: string, overrides?: {
  dueDate?: string; assigneeIds?: string[]; primaryAssigneeId?: string;
  departmentId?: string; teamId?: string; title?: string;
}) {
  const template = await prisma.taskTemplate.findUnique({ where: { id: templateId } });
  if (!template) throw new Error('Template not found');

  const taskData: any = {
    title: overrides?.title || template.title, description: template.taskDescription,
    status: 'PENDING', priority: template.priority, category: template.category,
    estimatedHours: template.estimatedHours,
    dueDate: overrides?.dueDate ? new Date(overrides.dueDate) : undefined,
    creatorId, departmentId: overrides?.departmentId || undefined,
    teamId: overrides?.teamId || undefined, templateId: template.id,
  };

  const task = await prisma.task.create({ data: taskData });
  const assigneeIds = overrides?.assigneeIds || [];

  for (const userId of assigneeIds) {
    await prisma.taskAssignee.create({
      data: { taskId: task.id, userId, isPrimary: userId === overrides?.primaryAssigneeId },
    });
  }

  for (const userId of assigneeIds) {
    if (userId !== creatorId) {
      await notificationService.create({
        userId, type: 'TASK_ASSIGNED', title: 'New Task Assigned',
        message: `You have been assigned to "${task.title}" from template`,
        taskId: task.id, actorId: creatorId,
      });
    }
  }

  await activityService.log({ taskId: task.id, userId: creatorId, action: 'Task created from template', details: { templateId: template.id, templateName: template.name } });
  return findTaskById(task.id);
}
