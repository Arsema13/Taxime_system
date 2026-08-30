import prisma from '../../config/database';
import { TaskStatus } from '@prisma/client';

export class DashboardTeamLeadService {
  async getTeamLeadDashboard(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, teamId: true, departmentId: true, role: true },
    });

    const teamTaskWhere: any = { isArchived: false };
    const memberWhere: any = {};

    if (user?.teamId) {
      teamTaskWhere.teamId = user.teamId;
      memberWhere.teamId = user.teamId;
    } else {
      teamTaskWhere.team = { members: { some: { id: userId } } };
      memberWhere.departmentId = user?.departmentId || '';
    }

    const [totalTasks, completedTasks, overdueTasks, pendingReview, tasksByStatus, teamMembers] = await Promise.all([
      prisma.task.count({ where: teamTaskWhere }),
      prisma.task.count({ where: { ...teamTaskWhere, status: 'COMPLETED' as TaskStatus } }),
      prisma.task.count({ where: { ...teamTaskWhere, status: 'OVERDUE' as TaskStatus } }),
      prisma.task.count({ where: { ...teamTaskWhere, status: 'SUBMITTED_FOR_REVIEW' as TaskStatus } }),
      prisma.task.groupBy({
        by: ['status'],
        where: teamTaskWhere,
        _count: { status: true },
      }),
      prisma.user.findMany({
        where: memberWhere,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          assignedTasks: {
            where: { task: { isArchived: false } },
            select: {
              task: {
                select: {
                  id: true,
                  status: true,
                  priority: true,
                  dueDate: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const teamSize = teamMembers.length;

    const memberWorkload = teamMembers.map((member: any) => {
      const assignedTasks = Array.isArray(member.assignedTasks) ? member.assignedTasks.map((item: any) => item.task) : [];
      const total = assignedTasks.length;
      const completed = assignedTasks.filter((task: any) => task.status === 'COMPLETED').length;
      const overdue = assignedTasks.filter((task: any) => task.status === 'OVERDUE').length;
      const inProgress = assignedTasks.filter((task: any) => ['IN_PROGRESS', 'ACCEPTED', 'SUBMITTED_FOR_REVIEW', 'UNDER_REVIEW'].includes(task.status)).length;

      return {
        userId: member.id,
        name: `${member.firstName} ${member.lastName}`.trim(),
        avatar: member.avatar,
        role: member.role,
        total,
        inProgress,
        completed,
        overdue,
      };
    });

    const upcomingDeadlines = await prisma.task.findMany({
      where: {
        ...teamTaskWhere,
        dueDate: { not: null },
        status: { notIn: ['COMPLETED', 'CANCELLED'] as TaskStatus[] },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        priority: true,
        status: true,
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    const recentActivityWhere = user?.teamId
      ? { OR: [{ user: { teamId: user.teamId } }, { task: { teamId: user.teamId } }] }
      : { OR: [{ userId: userId }, { task: { creatorId: userId } }, { task: { assignees: { some: { userId } } } }] };

    const recentActivity = await prisma.activityLog.findMany({
      where: recentActivityWhere,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    return {
      stats: {
        totalTasks,
        completedTasks,
        overdueTasks,
        pendingReview,
        completionRate,
        teamSize,
      },
      tasksByStatus: tasksByStatus.map((status) => ({
        status: status.status,
        count: status._count.status,
      })),
      memberWorkload,
      recentActivity: recentActivity.map((activity: any) => ({
        id: activity.id,
        action: activity.action,
        details: activity.details,
        taskId: activity.taskId,
        taskTitle: activity.task?.title ?? null,
        userId: activity.userId,
        userName: activity.user ? `${activity.user.firstName} ${activity.user.lastName}`.trim() : 'System',
        userAvatar: activity.user?.avatar ?? null,
        createdAt: activity.createdAt,
      })),
      upcomingDeadlines: upcomingDeadlines.map((task: any) => ({
        taskId: task.id,
        title: task.title,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
        priority: task.priority,
        status: task.status,
        daysLeft: task.dueDate ? Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
      })),
    };
  }
}
