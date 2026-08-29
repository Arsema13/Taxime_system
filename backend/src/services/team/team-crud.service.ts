import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { activityService } from '../activity.service';

export class TeamCrudService {
  async create(data: { name: string; description?: string; departmentId: string }, userId?: string) {
    const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!dept) throw new NotFoundError('Department not found');
    const team = await prisma.team.create({ data });

    if (userId) {
      await activityService.auditLog({
        userId, action: 'CREATE', entity: 'Team',
        entityId: team.id, newValues: data,
      });
    }

    return team;
  }

  async update(id: string, data: { name?: string; description?: string; isActive?: boolean; departmentId?: string }, userId?: string) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new NotFoundError('Team not found');
    const updated = await prisma.team.update({ where: { id }, data });

    if (userId) {
      await activityService.auditLog({
        userId, action: 'UPDATE', entity: 'Team',
        entityId: id, oldValues: { name: team.name }, newValues: data,
      });
    }

    return updated;
  }

  async delete(id: string, userId?: string) {
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) throw new NotFoundError('Team not found');
    const taskCount = await prisma.task.count({ where: { teamId: id } });
    if (taskCount > 0) throw new ConflictError('Cannot delete team with assigned tasks');
    await prisma.team.delete({ where: { id } });

    if (userId) {
      await activityService.auditLog({
        userId, action: 'DELETE', entity: 'Team',
        entityId: id, oldValues: { name: team.name },
      });
    }
  }
}
