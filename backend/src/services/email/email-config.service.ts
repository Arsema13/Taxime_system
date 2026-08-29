import nodemailer from 'nodemailer';
import { config } from '../../config';

export class EmailConfigService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }
    return this.transporter;
  }

  async send(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!config.email.user || !config.email.password) {
        console.log(`[Email] Would send to ${to}: ${subject}`);
        return false;
      }
      await this.getTransporter().sendMail({
        from: `"Taxime Task Management" <${config.email.user}>`,
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error('[Email] Failed to send:', error);
      return false;
    }
  }
}

export const emailConfigService = new EmailConfigService();
