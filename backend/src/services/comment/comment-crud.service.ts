import prisma from '../../config/database';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { activityService } from '../activity.service';
import { sendCommentNotifications } from './comment-notification.service';

export class CommentCrudService {
  async create(data: {
    taskId: string; authorId: string; content: string;
    parentId?: string; mentions?: string[];
  }) {
    const task = await prisma.task.findUnique({ where: { id: data.taskId } });
    if (!task) throw new NotFoundError('Task not found');

    if (data.parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: data.parentId } });
      if (!parent || parent.taskId !== data.taskId) throw new NotFoundError('Parent comment not found');
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        authorId: data.authorId,
        parentId: data.parentId,
      },
    });

    if (data.mentions && data.mentions.length > 0) {
      for (const userId of data.mentions) {
        await prisma.commentMention.create({ data: { commentId: comment.id, userId } });
      }
    }

    await sendCommentNotifications(comment.id, data.taskId, data.authorId, data.mentions || []);

    return prisma.comment.findUnique({
      where: { id: comment.id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        mentions: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });
  }

  async update(commentId: string, userId: string, content: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundError('Comment not found');
    if (comment.authorId !== userId) throw new ForbiddenError('You can only edit your own comments');

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content, isEdited: true },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    await activityService.log({
      taskId: comment.taskId, userId,
      action: 'Comment edited',
      details: { commentId },
    });

    return updated;
  }

  async delete(commentId: string, userId: string, userRole: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundError('Comment not found');
    if (comment.authorId !== userId && userRole !== 'COMMANDER') {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await activityService.log({
      taskId: comment.taskId, userId,
      action: 'Comment deleted',
      details: { commentId, content: comment.content },
    });

    await prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
  }
}
