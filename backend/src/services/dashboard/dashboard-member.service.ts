import prisma from '../../config/database';
import { TaskStatus } from '@prisma/client';

export class DashboardMemberService {
  async getMemberDashboard(userId: string) {
    const [myTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      prisma.task.count({
        where: { OR: [{ creatorId: userId }, { assignees: { some: { userId } } }], isArchived: false },
      }),
      prisma.task.count({
        where: { OR: [{ creatorId: userId }, { assignees: { some: { userId } } }], status: 'COMPLETED' as TaskStatus, isArchived: false },
      }),
      prisma.task.count({
        where: { OR: [{ creatorId: userId }, { assignees: { some: { userId } } }], status: { in: ['IN_PROGRESS', 'ACCEPTED'] as TaskStatus[] }, isArchived: false },
      }),
      prisma.task.count({
        where: { OR: [{ creatorId: userId }, { assignees: { some: { userId } } }], status: 'OVERDUE' as TaskStatus, isArchived: false },
      }),
    ]);
    const myTasksList = await prisma.task.findMany({
      where: {
        OR: [{ creatorId: userId }, { assignees: { some: { userId } } }],
        isArchived: false,
        status: { notIn: ['COMPLETED', 'CANCELLED'] as TaskStatus[] },
      },
      include: {
        assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });
    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        assignees: { some: { userId } },
        isArchived: false,
        status: { notIn: ['COMPLETED', 'CANCELLED'] as TaskStatus[] },
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });
    return {
      stats: { myTasks, completedTasks, inProgressTasks, overdueTasks },
      myTasksList,
      upcomingDeadlines,
    };
  }
}
