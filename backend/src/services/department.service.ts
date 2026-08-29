import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';
import { activityService } from './activity.service';

export class DepartmentService {
  async findAll(includeInactive = false) {
    return prisma.department.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: { select: { users: true, teams: true, tasks: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const dept = await prisma.department.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, firstName: true, lastName: true, role: true, avatar: true } },
        teams: { select: { id: true, name: true, _count: { select: { members: true } } } },
        _count: { select: { users: true, teams: true, tasks: true } },
      },
    });
    if (!dept) throw new NotFoundError('Department not found');
    return dept;
  }

  async create(data: { name: string; description?: string }, userId?: string) {
    const existing = await prisma.department.findUnique({ where: { name: data.name } });
    if (existing) throw new ConflictError('Department name already exists');
    const dept = await prisma.department.create({ data });

    if (userId) {
      await activityService.auditLog({
        userId, action: 'CREATE', entity: 'Department',
        entityId: dept.id, newValues: data,
      });
    }

    return dept;
  }

  async update(id: string, data: { name?: string; description?: string; isActive?: boolean }, userId?: string) {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundError('Department not found');
    if (data.name && data.name !== dept.name) {
      const existing = await prisma.department.findUnique({ where: { name: data.name } });
      if (existing) throw new ConflictError('Department name already exists');
    }
    const updated = await prisma.department.update({ where: { id }, data });

    if (userId) {
      await activityService.auditLog({
        userId, action: 'UPDATE', entity: 'Department',
        entityId: id, oldValues: { name: dept.name }, newValues: data,
      });
    }

    return updated;
  }

  async delete(id: string, userId?: string) {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) throw new NotFoundError('Department not found');
    const userCount = await prisma.user.count({ where: { departmentId: id } });
    if (userCount > 0) throw new ConflictError('Cannot delete department with assigned users');
    await prisma.department.delete({ where: { id } });

    if (userId) {
      await activityService.auditLog({
        userId, action: 'DELETE', entity: 'Department',
        entityId: id, oldValues: { name: dept.name },
      });
    }
  }
}

export const departmentService = new DepartmentService();
