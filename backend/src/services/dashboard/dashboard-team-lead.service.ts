import prisma from '../../config/database';
import { TaskStatus } from '@prisma/client';

export class DashboardTeamLeadService {
  async getTeamLeadDashboard(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { team: true } });
    let teamTaskWhere: any = { isArchived: false };
    let memberWhere: any = {};
    if (user?.teamId) {
      teamTaskWhere.teamId = user.teamId;
      memberWhere.teamId = user.teamId;
    } else {
      teamTaskWhere.team = { members: { some: { id: userId } } };
      memberWhere.departmentId = user?.departmentId || '';
    }
    const [teamTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      prisma.task.count({ where: teamTaskWhere }),
      prisma.task.count({ where: { ...teamTaskWhere, status: 'COMPLETED' as TaskStatus } }),
      prisma.task.count({ where: { ...teamTaskWhere, status: { in: ['IN_PROGRESS', 'ACCEPTED'] as TaskStatus[] } } }),
      prisma.task.count({ where: { ...teamTaskWhere, status: 'OVERDUE' as TaskStatus } }),
    ]);
    const pendingReview = await prisma.task.count({
      where: { ...teamTaskWhere, status: 'SUBMITTED_FOR_REVIEW' as TaskStatus },
    });
    const teamMembers = await prisma.user.findMany({
      where: memberWhere,
      select: {
        id: true, firstName: true, lastName: true, avatar: true,
        assignedTasks: {
          where: { task: { status: { notIn: ['COMPLETED', 'CANCELLED'] as TaskStatus[] } } },
          select: {
            task: { select: { id: true, priority: true, dueDate: true } },
          },
        },
      },
    });
    const enrichedMembers = teamMembers.map((m: any) => ({
      ...m,
      assignedTasks: m.assignedTasks.map((a: any) => a.task),
    }));
    const recentTasks = await prisma.task.findMany({
      where: teamTaskWhere,
      include: { assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return {
      stats: { teamTasks, completedTasks, inProgressTasks, overdueTasks, pendingReview },
      teamMembers: enrichedMembers,
      recentTasks,
    };
  }
}
