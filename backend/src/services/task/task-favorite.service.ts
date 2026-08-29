import prisma from '../../config/database';

export async function toggleFavorite(taskId: string, userId: string) {
  const existing = await prisma.userFavorite.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });
  if (existing) {
    await prisma.userFavorite.delete({ where: { id: existing.id } });
    return { isFavorite: false };
  }
  await prisma.userFavorite.create({ data: { userId, taskId } });
  return { isFavorite: true };
}
