import prisma from '../../config/database';

export async function searchTasksGlobal(query: string) {
  return prisma.task.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { some: { tag: { name: { contains: query, mode: 'insensitive' } } } } },
      ],
      isArchived: false,
    },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true } },
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
    },
    take: 20,
    orderBy: { updatedAt: 'desc' },
  });
}
