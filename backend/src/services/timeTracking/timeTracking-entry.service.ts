import prisma from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class TimeTrackingEntryService {
  async getEntriesByTask(taskId: string) {
    return prisma.taskTimeEntry.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getEntriesByUser(userId: string, dateFrom?: string, dateTo?: string) {
    const where: any = { userId, endTime: { not: null } };
    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) where.startTime.gte = new Date(dateFrom);
      if (dateTo) where.startTime.lte = new Date(dateTo);
    }

    const entries = await prisma.taskTimeEntry.findMany({
      where,
      include: {
        task: { select: { id: true, title: true } },
      },
      orderBy: { startTime: 'desc' },
    });

    const totalSeconds = entries.reduce((sum, e) => sum + (e.duration || 0), 0);

    return {
      entries,
      totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
      entryCount: entries.length,
    };
  }

  async deleteEntry(entryId: string, userId: string) {
    const entry = await prisma.taskTimeEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundError('Time entry not found');
    if (entry.userId !== userId) throw new BadRequestError('Not authorized');
    if (entry.endTime === null) throw new BadRequestError('Cannot delete a running timer');

    await prisma.taskTimeEntry.delete({ where: { id: entryId } });
    return { message: 'Time entry deleted' };
  }
}

export const timeTrackingEntryService = new TimeTrackingEntryService();
