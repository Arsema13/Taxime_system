import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { PaginatedResponse } from '../../types';
import { Role, UserStatus } from '@prisma/client';

export class UserQueryService {
  async findAll(query: {
    page?: number; limit?: number; search?: string; role?: string;
    status?: string; departmentId?: string; teamId?: string;
    sortBy?: string; sortOrder?: string;
  }): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20, search, role, status, departmentId, teamId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role) where.role = role as Role;
    if (status) where.status = status as UserStatus;
    if (departmentId) where.departmentId = departmentId;
    if (teamId) where.teamId = teamId;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true, phone: true,
          avatar: true, position: true, rank: true, role: true, status: true,
          departmentId: true, teamId: true, lastLoginAt: true, createdAt: true,
          department: { select: { id: true, name: true } },
          team: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, position: true, rank: true, role: true, status: true,
        departmentId: true, teamId: true, createdAt: true, lastLoginAt: true,
        department: { select: { id: true, name: true } },
        team: { select: { id: true, name: true } },
      },
    });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
