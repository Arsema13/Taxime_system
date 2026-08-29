import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { activityService } from '../activity.service';

export class TimeTrackingTimerService {
  async startTimer(taskId: string, userId: string, description?: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Task not found');

    const runningEntry = await prisma.taskTimeEntry.findFirst({
      where: { userId, endTime: null },
    });
    if (runningEntry) {
      throw new BadRequestError('You already have a running timer. Stop it first.');
    }

    const entry = await prisma.taskTimeEntry.create({
      data: {
        taskId,
        userId,
        description,
        startTime: new Date(),
      },
    });

    await activityService.log({
      taskId,
      userId,
      action: 'Timer started',
      details: { entryId: entry.id, description },
    });

    return entry;
  }

  async stopTimer(userId: string) {
    const runningEntry = await prisma.taskTimeEntry.findFirst({
      where: { userId, endTime: null },
      include: { task: { select: { id: true, title: true } } },
    });
    if (!runningEntry) throw new NotFoundError('No running timer found');

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - runningEntry.startTime.getTime()) / 1000);

    const updated = await prisma.taskTimeEntry.update({
      where: { id: runningEntry.id },
      data: { endTime, duration },
    });

    const totalEntries = await prisma.taskTimeEntry.findMany({
      where: { taskId: runningEntry.taskId, endTime: { not: null }, duration: { not: null } },
    });
    const totalSeconds = totalEntries.reduce((sum, e) => sum + (e.duration || 0), 0) + duration;
    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;
    await prisma.task.update({
      where: { id: runningEntry.taskId },
      data: { actualHours: totalHours },
    });

    await activityService.log({
      taskId: runningEntry.taskId,
      userId,
      action: 'Timer stopped',
      details: { entryId: updated.id, duration: `${Math.floor(duration / 60)}m ${duration % 60}s` },
    });

    return updated;
  }

  async getRunningTimer(userId: string) {
    return prisma.taskTimeEntry.findFirst({
      where: { userId, endTime: null },
      include: {
        task: { select: { id: true, title: true, status: true } },
      },
    });
  }
}

export const timeTrackingTimerService = new TimeTrackingTimerService();
