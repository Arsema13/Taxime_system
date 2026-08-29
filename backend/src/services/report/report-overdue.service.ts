import prisma from '../../config/database';

export class ReportOverdueService {
  async generateOverdueReport(query: any) {
    const where: any = { status: 'OVERDUE', isArchived: false };
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.teamId) where.teamId = query.teamId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        department: { select: { name: true } },
        team: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return {
      type: 'Overdue Report',
      total: tasks.length,
      data: tasks.map((t) => ({
        id: t.id, title: t.title, priority: t.priority,
        dueDate: t.dueDate,
        daysOverdue: t.dueDate
          ? Math.floor((Date.now() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0,
        assignees: t.assignees.map((a) => `${a.user.firstName} ${a.user.lastName}`),
        department: t.department?.name || 'N/A',
        team: t.team?.name || 'N/A',
      })),
    };
  }
}
