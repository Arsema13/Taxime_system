import { recurringCheckService } from './recurring-check.service';
import { recurringGenerateService } from './recurring-generate.service';
import { recurringTaskCreatorService } from './recurring-task-creator.service';

export class RecurringTaskJob {
  async processRecurringTasks() {
    return recurringGenerateService.processRecurringTasks();
  }

  shouldGenerateNext(task: any): boolean {
    return recurringCheckService.shouldGenerateNext(task);
  }

  calculateNextDueDate(currentDue: Date, recurrenceType: any): Date | null {
    return recurringCheckService.calculateNextDueDate(currentDue, recurrenceType);
  }
}

export const recurringTaskJob = new RecurringTaskJob();
