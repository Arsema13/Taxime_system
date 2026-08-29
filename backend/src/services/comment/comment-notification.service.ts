import prisma from '../../config/database';
import { notificationService } from '../notification.service';
import { socketService } from '../socket.service';
import { emailService } from '../email.service';

export async function sendCommentNotifications(
  commentId: string,
  taskId: string,
  authorId: string,
  mentions: string[],
) {
  const author = await prisma.user.findUnique({
    where: { id: authorId },
    select: { firstName: true, lastName: true },
  });
  const authorName = author ? `${author.firstName} ${author.lastName}` : 'Someone';

  const taskWithDetails = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignees: { select: { userId: true } },
      creator: { select: { id: true, email: true } },
    },
  });

  if (taskWithDetails) {
    const notifyUserIds = new Set<string>();
    if (taskWithDetails.creatorId !== authorId) notifyUserIds.add(taskWithDetails.creatorId);
    for (const a of taskWithDetails.assignees) {
      if (a.userId !== authorId) notifyUserIds.add(a.userId);
    }

    for (const uid of notifyUserIds) {
      await notificationService.create({
        userId: uid,
        type: 'COMMENT_ADDED',
        title: 'New Comment',
        message: `${authorName} commented on "${taskWithDetails.title}"`,
        taskId: taskWithDetails.id,
        actorId: authorId,
      });
      socketService.notifyUser(uid, 'notification', {
        type: 'COMMENT_ADDED',
        message: `${authorName} commented on "${taskWithDetails.title}"`,
      });
    }

    if (mentions && mentions.length > 0) {
      for (const mentionedUserId of mentions) {
        await notificationService.create({
          userId: mentionedUserId,
          type: 'MENTION',
          title: 'You were mentioned',
          message: `${authorName} mentioned you in "${taskWithDetails.title}"`,
          taskId: taskWithDetails.id,
          actorId: authorId,
        });
        socketService.notifyUser(mentionedUserId, 'notification', {
          type: 'MENTION',
          message: `${authorName} mentioned you in "${taskWithDetails.title}"`,
        });

        const mentionedUser = await prisma.user.findUnique({
          where: { id: mentionedUserId },
          select: { email: true },
        });
        if (mentionedUser?.email) {
          await emailService.sendMention(mentionedUser.email, authorName, taskWithDetails.title);
        }
      }
    }
  }
}
