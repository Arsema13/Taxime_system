import prisma from '../../config/database';

export class ReportTimelineService {
  async generateCompletionTimeline(query: any) {
    const where: any = { status: 'COMPLETED', completedAt: { not: null } };
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.teamId) where.teamId = query.teamId;
    if (query.dateFrom || query.dateTo) {
      where.completedAt = {};
      if (query.dateFrom) where.completedAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.completedAt.lte = new Date(query.dateTo);
    }

    const tasks = await prisma.task.findMany({
      where,
      select: { completedAt: true, priority: true, category: true },
    });

    const daily: Record<string, number> = {};
    for (const task of tasks) {
      if (task.completedAt) {
        const key = task.completedAt.toISOString().split('T')[0];
        daily[key] = (daily[key] || 0) + 1;
      }
    }

    return {
      type: 'Completion Timeline',
      data: Object.entries(daily)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  }
}
