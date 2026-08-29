import prisma from '../../config/database';

export class ReportEmployeeService {
  async generateEmployeePerformance(query: any) {
    const where: any = {};
    if (query.departmentId) where.departmentId = query.departmentId;

    const users = await prisma.user.findMany({
      where: { ...where, status: 'ACTIVE' },
      select: {
        id: true, firstName: true, lastName: true, email: true, role: true,
        department: { select: { name: true } },
      },
    });

    const performance = await Promise.all(
      users.map(async (user) => {
        const [assigned, completed, overdue, rejected] = await Promise.all([
          prisma.task.count({ where: { assignees: { some: { userId: user.id } } } }),
          prisma.task.count({ where: { assignees: { some: { userId: user.id } }, status: 'COMPLETED' } }),
          prisma.task.count({ where: { assignees: { some: { userId: user.id } }, status: 'OVERDUE' } }),
          prisma.task.count({ where: { assignees: { some: { userId: user.id } }, status: 'REJECTED' } }),
        ]);

        return {
          ...user,
          department: user.department?.name || 'N/A',
          assigned,
          completed,
          overdue,
          rejected,
          completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
        };
      })
    );

    return { type: 'Employee Performance', data: performance };
  }
}
