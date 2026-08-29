import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { activityService } from '../activity.service';

export async function addDependency(taskId: string, dependsOnId: string, userId: string) {
  if (taskId === dependsOnId) throw new BadRequestError('A task cannot depend on itself');

  const [task, dependsOn] = await Promise.all([
    prisma.task.findUnique({ where: { id: taskId } }),
    prisma.task.findUnique({ where: { id: dependsOnId } }),
  ]);
  if (!task) throw new NotFoundError('Task not found');
  if (!dependsOn) throw new NotFoundError('Dependency task not found');

  const existing = await prisma.taskDependency.findFirst({ where: { taskId: dependsOnId, dependsOnId: taskId } });
  if (existing) throw new BadRequestError('Circular dependency detected');

  const dependency = await prisma.taskDependency.create({ data: { taskId, dependsOnId } });
  await activityService.log({ taskId, userId, action: 'Dependency added', details: { dependsOnId } });
  return dependency;
}

export async function removeDependency(taskId: string, dependsOnId: string) {
  await prisma.taskDependency.deleteMany({ where: { taskId, dependsOnId } });
  return { message: 'Dependency removed' };
}
