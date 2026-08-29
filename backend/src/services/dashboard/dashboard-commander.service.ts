import prisma from '../../config/database';
import { TaskStatus } from '@prisma/client';

export class DashboardCommanderService {
  async getCommanderDashboard() {
    const [
      totalTasks, completedTasks, inProgressTasks, overdueTasks,
      totalUsers, activeUsers, totalDepartments, totalTeams,
    ] = await Promise.all([
      prisma.task.count({ where: { isArchived: false } }),
      prisma.task.count({ where: { status: 'COMPLETED' as TaskStatus, isArchived: false } }),
      prisma.task.count({ where: { status: { in: ['IN_PROGRESS', 'ACCEPTED', 'SUBMITTED_FOR_REVIEW'] as TaskStatus[] }, isArchived: false } }),
      prisma.task.count({ where: { status: 'OVERDUE' as TaskStatus, isArchived: false } }),
      prisma.user.count({ where: { status: 'ACTIVE' as any } }),
      prisma.user.count({ where: { status: 'ACTIVE' as any, lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.team.count({ where: { isActive: true } }),
    ]);
    const [tasksByPriority, tasksByStatus, tasksByCategory] = await Promise.all([
      prisma.task.groupBy({ by: ['priority'], where: { isArchived: false }, _count: true }),
      prisma.task.groupBy({ by: ['status'], where: { isArchived: false }, _count: true }),
      prisma.task.groupBy({ by: ['category'], where: { isArchived: false }, _count: true }),
    ]);
    const recentTasks = await prisma.task.findMany({
      where: { isArchived: false },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const departmentPerformance = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { tasks: true } },
        tasks: { where: { status: 'COMPLETED' as TaskStatus }, select: { id: true } },
      },
    });
    return {
      stats: {
        totalTasks, completedTasks, inProgressTasks, overdueTasks,
        totalUsers, activeUsers, totalDepartments, totalTeams,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      tasksByPriority: tasksByPriority.map((t) => ({ priority: t.priority, count: t._count })),
      tasksByStatus: tasksByStatus.map((t) => ({ status: t.status, count: t._count })),
      tasksByCategory: tasksByCategory.map((t) => ({ category: t.category, count: t._count })),
      recentTasks,
      departmentPerformance: departmentPerformance.map((d) => ({
        id: d.id, name: d.name, totalTasks: d._count.tasks,
        completedTasks: d.tasks.length,
        completionRate: d._count.tasks > 0 ? Math.round((d.tasks.length / d._count.tasks) * 100) : 0,
      })),
      taskCompletionOverTime: await this.getTaskCompletionOverTime(),
    };
  }

  private async getTaskCompletionOverTime() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const completedTasks = await prisma.task.findMany({
      where: { status: 'COMPLETED' as TaskStatus, completedAt: { gte: thirtyDaysAgo } },
      select: { completedAt: true },
    });
    const daily: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      daily[date.toISOString().split('T')[0]] = 0;
    }
    for (const task of completedTasks) {
      if (task.completedAt) {
        const key = task.completedAt.toISOString().split('T')[0];
        if (daily[key] !== undefined) daily[key]++;
      }
    }
    return Object.entries(daily)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
