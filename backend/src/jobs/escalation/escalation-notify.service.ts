import { notificationService } from '../../services/notification.service';
import { emailService } from '../../services/email.service';
import { socketService } from '../../services/socket.service';

export class EscalationNotifyService {
  async sendEscalationNotifications(
    targets: any[],
    task: { id: string; title: string },
    thresholdHours: number,
  ) {
    for (const target of targets) {
      await notificationService.create({
        userId: target.id,
        type: 'TASK_OVERDUE',
        title: `Escalated Overdue Task`,
        message: `Task "${task.title}" has been overdue for ${thresholdHours}+ hours and requires attention`,
        taskId: task.id,
      });

      socketService.notifyUser(target.id, 'notification', {
        type: 'TASK_OVERDUE',
        message: `Escalated: "${task.title}" overdue for ${thresholdHours}+ hours`,
      });

      if (target.email) {
        await emailService.send(
          target.email,
          `Escalated Overdue Task: ${task.title}`,
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#dc2626;">Escalated Overdue Task</h2>
            <p>The task <strong>${task.title}</strong> has been overdue for ${thresholdHours}+ hours.</p>
            <p>This task requires your immediate attention.</p>
            <hr style="border:1px solid #e5e7eb;"/>
            <p style="color:#6b7280;font-size:12px;">Taxime Operations & Task Management System</p>
          </div>`,
        );
      }
    }
  }
}

export const escalationNotifyService = new EscalationNotifyService();
