import prisma from '../../config/database';
import { TaskStatus } from '@prisma/client';

export async function getWorkload(teamId?: string, departmentId?: string) {
  const where: any = { status: { notIn: ['COMPLETED', 'CANCELLED'] as TaskStatus[] } };
  if (teamId) where.teamId = teamId;
  if (departmentId) where.departmentId = departmentId;

  const tasks = await prisma.task.findMany({
    where,
    include: { assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
  });

  const workload: Record<string, { user: any; activeTasks: number; overdueTasks: number }> = {};

  for (const task of tasks) {
    for (const assignee of task.assignees) {
      const uid = assignee.userId;
      if (!workload[uid]) {
        workload[uid] = { user: assignee.user, activeTasks: 0, overdueTasks: 0 };
      }
      workload[uid].activeTasks++;
      if (task.status === 'OVERDUE') workload[uid].overdueTasks++;
    }
  }

  return Object.values(workload);
}
