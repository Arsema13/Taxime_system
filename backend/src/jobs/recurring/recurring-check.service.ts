import { RecurrenceType } from '@prisma/client';

export class RecurringCheckService {
  shouldGenerateNext(task: any): boolean {
    if (!task.dueDate) return false;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const hoursSinceDue = (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceDue >= 0 && hoursSinceDue < 48;
  }

  calculateNextDueDate(currentDue: Date, recurrenceType: RecurrenceType): Date | null {
    const next = new Date(currentDue);
    switch (recurrenceType) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        return next;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        return next;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        return next;
      default:
        return null;
    }
  }
}

export const recurringCheckService = new RecurringCheckService();
