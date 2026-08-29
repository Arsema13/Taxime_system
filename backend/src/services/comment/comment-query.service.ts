import prisma from '../../config/database';

export class CommentQueryService {
  async findByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId, parentId: null },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        mentions: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        replies: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
            mentions: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
