import prisma from '../../config/database';

export class ReportTaskSummaryService {
  async generateTaskSummary(query: any) {
    const where: any = { isArchived: false };
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.teamId) where.teamId = query.teamId;
    if (query.priority) where.priority = query.priority;
    if (query.status) where.status = query.status;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [total, byStatus, byPriority, byCategory] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.groupBy({ by: ['status'], where, _count: true }),
      prisma.task.groupBy({ by: ['priority'], where, _count: true }),
      prisma.task.groupBy({ by: ['category'], where, _count: true }),
    ]);

    return {
      type: 'Task Summary',
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count })),
      byCategory: byCategory.map((c) => ({ category: c.category, count: c._count })),
    };
  }
}
