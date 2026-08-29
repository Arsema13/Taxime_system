import prisma from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { hashPassword } from '../../utils/helpers';
import { Role, UserStatus } from '@prisma/client';

export class UserCrudService {
  async create(data: {
    email: string; password: string; firstName: string; lastName: string;
    phone?: string; position?: string; rank?: string; role?: string;
    departmentId?: string; teamId?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictError('Email already in use');

    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        position: data.position,
        rank: data.rank,
        role: (data.role as Role) || 'MEMBER',
        departmentId: data.departmentId || null,
        teamId: data.teamId || null,
      },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true,
        departmentId: true, teamId: true, createdAt: true,
      },
    });
    return user;
  }

  async update(id: string, data: {
    firstName?: string; lastName?: string; phone?: string;
    position?: string; rank?: string; avatar?: string;
    role?: string; status?: string; departmentId?: string | null; teamId?: string | null;
  }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');

    const updateData: any = { ...data };
    if (data.role) updateData.role = data.role as Role;
    if (data.status) updateData.status = data.status as UserStatus;

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, position: true, rank: true, role: true, status: true,
        departmentId: true, teamId: true, createdAt: true,
      },
    });
  }

  async deactivate(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');
    return prisma.user.update({ where: { id }, data: { status: 'INACTIVE' as UserStatus } });
  }

  async activate(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User not found');
    return prisma.user.update({ where: { id }, data: { status: 'ACTIVE' as UserStatus } });
  }
}
