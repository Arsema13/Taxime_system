import prisma from '../config/database';

export class SavedFilterService {
  async findAll(userId: string) {
    return prisma.savedFilter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, name: string, filters: any) {
    return prisma.savedFilter.create({
      data: { name, filters, userId },
    });
  }

  async delete(id: string, userId: string) {
    const filter = await prisma.savedFilter.findFirst({ where: { id, userId } });
    if (!filter) return null;
    await prisma.savedFilter.delete({ where: { id } });
    return { message: 'Filter deleted' };
  }
}

export const savedFilterService = new SavedFilterService();
