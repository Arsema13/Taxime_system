import { emailConfigService } from './email-config.service';

export class EmailTemplatesService {
  async sendTaskAssigned(to: string, taskTitle: string, assignedBy: string): Promise<boolean> {
    return emailConfigService.send(to, `New Task Assigned: ${taskTitle}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">New Task Assigned</h2>
        <p>You have been assigned to <strong>${taskTitle}</strong> by ${assignedBy}.</p>
        <p>Please log in to view the task details and accept the assignment.</p>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Taxime Operations & Task Management System</p>
      </div>
    `);
  }

  async sendTaskCompleted(to: string, taskTitle: string, completedBy: string): Promise<boolean> {
    return emailConfigService.send(to, `Task Completed: ${taskTitle}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Task Completed</h2>
        <p><strong>${taskTitle}</strong> has been completed by ${completedBy}.</p>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Taxime Operations & Task Management System</p>
      </div>
    `);
  }

  async sendCommentAdded(to: string, taskTitle: string, commentedBy: string, comment: string): Promise<boolean> {
    return emailConfigService.send(to, `New Comment on: ${taskTitle}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">New Comment</h2>
        <p>${commentedBy} commented on <strong>${taskTitle}</strong>:</p>
        <blockquote style="border-left: 3px solid #0d9488; padding-left: 12px; color: #374151;">
          ${comment}
        </blockquote>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Taxime Operations & Task Management System</p>
      </div>
    `);
  }

  async sendMention(to: string, mentionedBy: string, taskTitle: string): Promise<boolean> {
    return emailConfigService.send(to, `You were mentioned in: ${taskTitle}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">You were mentioned</h2>
        <p>${mentionedBy} mentioned you in <strong>${taskTitle}</strong>.</p>
        <p>Please log in to view the conversation.</p>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Taxime Operations & Task Management System</p>
      </div>
    `);
  }

  async sendDeadlineReminder(to: string, taskTitle: string, dueDate: Date): Promise<boolean> {
    const formatted = dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return emailConfigService.send(to, `Deadline Reminder: ${taskTitle}`, `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Deadline Reminder</h2>
        <p>The task <strong>${taskTitle}</strong> is due on <strong>${formatted}</strong>.</p>
        <p>Please ensure the task is completed before the deadline.</p>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Taxime Operations & Task Management System</p>
      </div>
    `);
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<boolean> {
    return emailConfigService.send(to, 'Password Reset Request', `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d9488;">Password Reset</h2>
        <p>You requested a password reset. Use the following token:</p>
        <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px;">
          ${resetToken}
        </div>
        <p>This token expires in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: 1px solid #e5e7eb;" />
        <p style="color: #6b7280; font-size: 12px;">Taxime Operations & Task Management System</p>
      </div>
    `);
  }
}

export const emailTemplatesService = new EmailTemplatesService();
