import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export class UserStatsService {
  async getStats(userId: string) {
    const [completed, inProgress, overdue, assigned, tasksCreated] = await Promise.all([
      prisma.task.count({ where: { assignees: { some: { userId } }, status: 'COMPLETED' } }),
      prisma.task.count({ where: { assignees: { some: { userId } }, status: { in: ['IN_PROGRESS', 'ACCEPTED', 'SUBMITTED_FOR_REVIEW'] as any } } }),
      prisma.task.count({ where: { assignees: { some: { userId } }, status: 'OVERDUE' } }),
      prisma.task.count({ where: { assignees: { some: { userId } } } }),
      prisma.task.count({ where: { creatorId: userId } }),
    ]);

    return {
      completed,
      inProgress,
      overdue,
      assigned,
      tasksCreated,
      completionRate: assigned > 0 ? Math.round((completed / assigned) * 100) : 0,
    };
  }

  async updateMe(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatar?: string; position?: string; rank?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');

    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, position: true, rank: true, role: true, status: true,
        departmentId: true, teamId: true, createdAt: true,
      },
    });
  }
}
