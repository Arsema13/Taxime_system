import prisma from '../../config/database';
import { PaginatedResponse } from '../../types';
import { TaskStatus, TaskPriority, TaskCategory } from '@prisma/client';

export async function findAllTask(query: {
  page?: number; limit?: number; search?: string; status?: string; priority?: string;
  category?: string; departmentId?: string; teamId?: string; assigneeId?: string;
  creatorId?: string; dueDateFrom?: string; dueDateTo?: string; isArchived?: string;
  tags?: string; sortBy?: string; sortOrder?: string; userId?: string; userRole?: string;
}): Promise<PaginatedResponse<any>> {
  const {
    page = 1, limit = 20, search, status, priority, category, departmentId,
    teamId, assigneeId, creatorId, dueDateFrom, dueDateTo, isArchived,
    tags, sortBy = 'createdAt', sortOrder = 'desc', userId, userRole,
  } = query;
  const skip = (page - 1) * limit;
  const where: any = buildWhereClause({ userRole, userId, search, status, priority, category, departmentId, teamId, assigneeId, creatorId, isArchived, dueDateFrom, dueDateTo, tags });

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where, skip, take: limit,
      include: {
        creator: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
        department: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        subtasks: { select: { id: true, isCompleted: true } },
        _count: { select: { comments: true, attachments: true, subtasks: true } },
      },
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.task.count({ where }),
  ]);

  const enriched = tasks.map((t: any) => ({
    ...t,
    subtaskProgress: t.subtasks.length > 0
      ? { completed: t.subtasks.filter((s: any) => s.isCompleted).length, total: t.subtasks.length }
      : null,
  }));

  return {
    data: enriched,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
  };
}

function buildWhereClause(filters: any): any {
  const { userRole, userId, search, status, priority, category, departmentId, teamId, assigneeId, creatorId, isArchived, dueDateFrom, dueDateTo, tags } = filters;
  const where: any = {};

  if (userRole === 'TEAM_LEAD' && userId) {
    where.OR = [{ creatorId: userId }, { assignees: { some: { userId } } }, { team: { members: { some: { userId } } } }];
  } else if (userRole === 'MEMBER' && userId) {
    where.OR = [{ creatorId: userId }, { assignees: { some: { userId } } }];
  }

  if (search) {
    where.AND = where.AND || [];
    where.AND.push({ OR: [{ title: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] });
  }

  if (status) where.status = status as TaskStatus;
  if (priority) where.priority = priority as TaskPriority;
  if (category) where.category = category as TaskCategory;
  if (departmentId) where.departmentId = departmentId;
  if (teamId) where.teamId = teamId;
  if (assigneeId) where.assignees = { some: { userId: assigneeId } };
  if (creatorId) where.creatorId = creatorId;
  if (isArchived !== undefined) where.isArchived = isArchived === 'true';
  if (dueDateFrom || dueDateTo) {
    where.dueDate = {};
    if (dueDateFrom) where.dueDate.gte = new Date(dueDateFrom);
    if (dueDateTo) where.dueDate.lte = new Date(dueDateTo);
  }
  if (tags) {
    const tagNames = tags.split(',');
    where.tags = { some: { tag: { name: { in: tagNames } } } };
  }

  return where;
}
