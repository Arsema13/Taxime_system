import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';

export async function findTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
      assignees: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true, position: true, role: true } } } },
      department: { select: { id: true, name: true } },
      team: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      subtasks: {
        include: { assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
        orderBy: { order: 'asc' as const },
      },
      dependencies: { include: { dependsOn: { select: { id: true, title: true, status: true } } } },
      dependentTasks: { include: { task: { select: { id: true, title: true, status: true } } } },
      comments: {
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          mentions: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          replies: { include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } } },
        },
        where: { parentId: null },
        orderBy: { createdAt: 'desc' as const },
      },
      attachments: { include: { uploader: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' as const } },
      activityLogs: { include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } }, orderBy: { createdAt: 'desc' as const }, take: 50 },
      timeEntries: { include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { startTime: 'desc' as const } },
      favorites: true,
      _count: { select: { comments: true, attachments: true } },
    },
  });
  if (!task) throw new NotFoundError('Task not found');
  return task;
}
