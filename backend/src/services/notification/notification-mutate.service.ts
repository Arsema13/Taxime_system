import prisma from '../../config/database';

export class NotificationMutateService {
  async create(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    taskId?: string;
    actorId?: string;
    link?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        taskId: data.taskId,
        actorId: data.actorId,
        link: data.link,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) return null;
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  async delete(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) return null;
    await prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted' };
  }
}

export const notificationMutateService = new NotificationMutateService();
