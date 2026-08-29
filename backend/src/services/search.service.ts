import prisma from '../config/database';
import { TaskStatus } from '@prisma/client';

export class SearchService {
  async globalSearch(query: string, userId: string, userRole: string) {
    const term = query.trim();
    if (!term) return { tasks: [], users: [], departments: [], teams: [] };

    const [tasks, users, departments, teams] = await Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { tags: { some: { tag: { name: { contains: term, mode: 'insensitive' } } } } },
          ],
          isArchived: false,
        },
        include: {
          creator: { select: { id: true, firstName: true, lastName: true } },
          assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          department: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } },
        },
        take: 20,
        orderBy: { updatedAt: 'desc' },
      }),

      prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            { position: { contains: term, mode: 'insensitive' } },
          ],
          status: 'ACTIVE',
        },
        select: {
          id: true, firstName: true, lastName: true, email: true,
          avatar: true, role: true, position: true,
          department: { select: { id: true, name: true } },
        },
        take: 20,
      }),

      prisma.department.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        select: {
          id: true, name: true, description: true,
          _count: { select: { tasks: true, users: true, teams: true } },
        },
        take: 20,
      }),

      prisma.team.findMany({
        where: {
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
          ],
          isActive: true,
        },
        select: {
          id: true, name: true, description: true,
          department: { select: { id: true, name: true } },
          _count: { select: { members: true, tasks: true } },
        },
        take: 20,
      }),
    ]);

    return { tasks, users, departments, teams };
  }
}

export const searchService = new SearchService();
