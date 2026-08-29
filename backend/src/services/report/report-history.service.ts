import prisma from '../../config/database';

export class ReportHistoryService {
  async generateTaskHistory(query: any) {
    const where: any = {};
    if (query.taskId) where.taskId = query.taskId;
    if (query.userId) where.userId = query.userId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return { type: 'Task History', data: logs };
  }
}
