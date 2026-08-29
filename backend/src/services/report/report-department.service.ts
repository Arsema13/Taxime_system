import prisma from '../../config/database';

export class ReportDepartmentService {
  async generateDepartmentReport(query: any) {
    const departments = await prisma.department.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { tasks: true, users: true, teams: true } },
        tasks: { select: { status: true, priority: true } },
      },
    });

    return {
      type: 'Department Report',
      data: departments.map((dept) => {
        const completed = dept.tasks.filter((t) => t.status === 'COMPLETED').length;
        const overdue = dept.tasks.filter((t) => t.status === 'OVERDUE').length;
        return {
          id: dept.id, name: dept.name,
          users: dept._count.users, teams: dept._count.teams,
          totalTasks: dept._count.tasks, completedTasks: completed, overdueTasks: overdue,
          completionRate: dept._count.tasks > 0 ? Math.round((completed / dept._count.tasks) * 100) : 0,
        };
      }),
    };
  }
}
