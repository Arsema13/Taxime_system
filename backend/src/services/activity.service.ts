import prisma from '../config/database';

export class ActivityService {
  async log(data: { taskId: string; userId: string; action: string; details?: any }) {
    return prisma.activityLog.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        action: data.action,
        details: data.details || undefined,
      },
    });
  }

  async findByTask(taskId: string, limit = 50) {
    return prisma.activityLog.findMany({
      where: { taskId },
      include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async auditLog(data: {
    userId: string; action: string; entity: string;
    entityId?: string; oldValues?: any; newValues?: any; ip?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action as any,
        entity: data.entity,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ip: data.ip,
      },
    });
  }

  async getAuditLogs(query: {
    page?: number; limit?: number; userId?: string;
    action?: string; entity?: string; dateFrom?: string; dateTo?: string;
  }) {
    const { page = 1, limit = 50, userId, action, entity, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: limit,
        include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }
}

export const activityService = new ActivityService();
