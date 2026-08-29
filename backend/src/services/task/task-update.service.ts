import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { activityService } from '../activity.service';
import { findTaskById } from './task-query.service';

export async function updateTask(id: string, userId: string, _userRole: string, data: Record<string, any>) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new NotFoundError('Task not found');

  const updateData: any = {};
  if (data.title) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.priority) updateData.priority = data.priority;
  if (data.category) updateData.category = data.category;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours;
  if (data.progress !== undefined) updateData.progress = data.progress;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.vehicleReference !== undefined) updateData.vehicleReference = data.vehicleReference;
  if (data.customerReference !== undefined) updateData.customerReference = data.customerReference;
  if (data.externalRef !== undefined) updateData.externalRef = data.externalRef;
  if (data.isArchived !== undefined) updateData.isArchived = data.isArchived;
  if (data.departmentId !== undefined) updateData.departmentId = data.departmentId || null;
  if (data.teamId !== undefined) updateData.teamId = data.teamId || null;

  await prisma.task.update({ where: { id }, data: updateData });
  await activityService.log({ taskId: id, userId, action: 'Task updated', details: { changes: updateData } });
  return findTaskById(id);
}

export async function deleteTask(id: string, _userId: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new NotFoundError('Task not found');
  await prisma.task.delete({ where: { id } });
  return { message: 'Task deleted successfully' };
}
