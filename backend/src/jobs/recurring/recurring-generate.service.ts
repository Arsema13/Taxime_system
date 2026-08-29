import prisma from '../../config/database';
import { TaskStatus } from '@prisma/client';
import { recurringCheckService } from './recurring-check.service';
import { recurringTaskCreatorService } from './recurring-task-creator.service';

export class RecurringGenerateService {
  async processRecurringTasks() {
    const recurringTasks = await prisma.task.findMany({
      where: {
        isRecurring: true,
        status: 'COMPLETED' as TaskStatus,
        recurrenceType: { not: null },
      },
      include: {
        creator: { select: { id: true, firstName: true, lastName: true } },
        assignees: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
        tags: { include: { tag: true } },
      },
    });

    for (const task of recurringTasks) {
      const shouldGenerate = recurringCheckService.shouldGenerateNext(task);
      if (!shouldGenerate) continue;

      const nextDueDate = recurringCheckService.calculateNextDueDate(task.dueDate!, task.recurrenceType!);
      if (!nextDueDate) continue;

      if (task.recurrenceEnd && nextDueDate > task.recurrenceEnd) continue;

      const existingNext = await prisma.task.findFirst({
        where: {
          title: task.title,
          status: { notIn: ['COMPLETED', 'CANCELLED'] as TaskStatus[] },
          dueDate: {
            gte: new Date(nextDueDate.getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(nextDueDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      if (existingNext) continue;

      const newTask = await recurringTaskCreatorService.createNextTask(task, nextDueDate);
      await recurringTaskCreatorService.logAndNotify(newTask, task, nextDueDate);
    }
  }
}

export const recurringGenerateService = new RecurringGenerateService();
