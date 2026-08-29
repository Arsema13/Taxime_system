import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { activityService } from '../activity.service';

export async function addSubtask(taskId: string, data: { title: string; assigneeIds?: string[] }, creatorId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');

  const count = await prisma.subtask.count({ where: { taskId } });
  const subtask = await prisma.subtask.create({
    data: {
      title: data.title, order: count, taskId, creatorId,
      assignees: data.assigneeIds
        ? { create: data.assigneeIds.map((userId) => ({ userId })) }
        : undefined,
    },
  });

  await activityService.log({ taskId, userId: creatorId, action: 'Subtask added', details: { title: data.title } });
  return subtask;
}

export async function toggleSubtask(subtaskId: string, _userId: string) {
  const subtask = await prisma.subtask.findUnique({ where: { id: subtaskId }, include: { task: true } });
  if (!subtask) throw new NotFoundError('Subtask not found');

  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: { isCompleted: !subtask.isCompleted },
  });

  const allSubtasks = await prisma.subtask.findMany({ where: { taskId: subtask.taskId } });
  const completed = allSubtasks.filter((s) => s.isCompleted || s.id === subtaskId).length;
  const progress = Math.round((completed / allSubtasks.length) * 100);
  await prisma.task.update({ where: { id: subtask.taskId }, data: { progress } });

  return updated;
}
