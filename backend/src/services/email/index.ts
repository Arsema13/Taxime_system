import { emailConfigService } from './email-config.service';
import { emailTemplatesService } from './email-templates.service';

export class EmailService {
  async send(to: string, subject: string, html: string): Promise<boolean> {
    return emailConfigService.send(to, subject, html);
  }

  async sendTaskAssigned(to: string, taskTitle: string, assignedBy: string): Promise<boolean> {
    return emailTemplatesService.sendTaskAssigned(to, taskTitle, assignedBy);
  }

  async sendTaskCompleted(to: string, taskTitle: string, completedBy: string): Promise<boolean> {
    return emailTemplatesService.sendTaskCompleted(to, taskTitle, completedBy);
  }

  async sendCommentAdded(to: string, taskTitle: string, commentedBy: string, comment: string): Promise<boolean> {
    return emailTemplatesService.sendCommentAdded(to, taskTitle, commentedBy, comment);
  }

  async sendMention(to: string, mentionedBy: string, taskTitle: string): Promise<boolean> {
    return emailTemplatesService.sendMention(to, mentionedBy, taskTitle);
  }

  async sendDeadlineReminder(to: string, taskTitle: string, dueDate: Date): Promise<boolean> {
    return emailTemplatesService.sendDeadlineReminder(to, taskTitle, dueDate);
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<boolean> {
    return emailTemplatesService.sendPasswordReset(to, resetToken);
  }
}

export const emailService = new EmailService();
