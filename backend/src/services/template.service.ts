import prisma from '../config/database';
import { NotFoundError, ConflictError } from '../utils/errors';

export class TemplateService {
  async findAll(userId: string) {
    return prisma.taskTemplate.findMany({
      where: { isActive: true },
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const template = await prisma.taskTemplate.findUnique({
      where: { id },
      include: { creator: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  async create(data: {
    name: string; description?: string; title: string; taskDescription?: string;
    priority?: string; category?: string; estimatedHours?: number; creatorId: string;
  }) {
    return prisma.taskTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        title: data.title,
        taskDescription: data.taskDescription,
        priority: (data.priority as any) || 'MEDIUM',
        category: (data.category as any) || 'OTHER',
        estimatedHours: data.estimatedHours,
        creatorId: data.creatorId,
      },
    });
  }

  async update(id: string, data: Record<string, any>) {
    const template = await prisma.taskTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundError('Template not found');
    return prisma.taskTemplate.update({ where: { id }, data });
  }

  async delete(id: string) {
    const template = await prisma.taskTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundError('Template not found');
    await prisma.taskTemplate.update({ where: { id }, data: { isActive: false } });
  }
}

export const templateService = new TemplateService();
