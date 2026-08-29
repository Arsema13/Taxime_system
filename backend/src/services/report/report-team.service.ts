import prisma from '../../config/database';

export class ReportTeamService {
  async generateTeamPerformance(query: any) {
    const where: any = { isActive: true };
    if (query.departmentId) where.departmentId = query.departmentId;

    const teams = await prisma.team.findMany({
      where,
      include: {
        members: { select: { id: true } },
        tasks: { select: { id: true, status: true, createdAt: true, completedAt: true } },
      },
    });

    return {
      type: 'Team Performance',
      data: teams.map((team) => {
        const completed = team.tasks.filter((t) => t.status === 'COMPLETED').length;
        const overdue = team.tasks.filter((t) => t.status === 'OVERDUE').length;
        const avgCompletionTime = team.tasks
          .filter((t) => t.completedAt)
          .reduce((acc, t) => acc + (new Date(t.completedAt!).getTime() - new Date(t.createdAt).getTime()), 0) /
          (completed || 1);

        return {
          id: team.id,
          name: team.name,
          memberCount: team.members.length,
          totalTasks: team.tasks.length,
          completedTasks: completed,
          overdueTasks: overdue,
          completionRate: team.tasks.length > 0 ? Math.round((completed / team.tasks.length) * 100) : 0,
          avgCompletionTimeHours: Math.round(avgCompletionTime / (1000 * 60 * 60) * 10) / 10,
        };
      }),
    };
  }
}
