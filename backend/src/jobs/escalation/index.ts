import { escalationCheckService } from './escalation-check.service';
import { escalationNotifyService } from './escalation-notify.service';

export class TaskEscalationJob {
  async escalateOverdueTasks() {
    return escalationCheckService.escalateOverdueTasks();
  }

  async sendEscalationNotifications(
    targets: any[],
    task: { id: string; title: string },
    thresholdHours: number,
  ) {
    return escalationNotifyService.sendEscalationNotifications(targets, task, thresholdHours);
  }
}

export const taskEscalationJob = new TaskEscalationJob();
