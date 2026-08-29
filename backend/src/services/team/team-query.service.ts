import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { PaginatedResponse } from '../../types';

export class TeamQueryService {
  async findAll(query: { page?: number; limit?: number; departmentId?: string; search?: string }): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, departmentId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };
    if (departmentId) where.departmentId = departmentId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        where, skip, take: limit,
        include: {
          department: { select: { id: true, name: true } },
          _count: { select: { members: true, tasks: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.team.count({ where }),
    ]);

    return {
      data: teams,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }

  async findById(id: string) {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        members: {
          select: { id: true, firstName: true, lastName: true, email: true, avatar: true, position: true, role: true },
        },
        _count: { select: { members: true, tasks: true } },
      },
    });
    if (!team) throw new NotFoundError('Team not found');
    return team;
  }
}
