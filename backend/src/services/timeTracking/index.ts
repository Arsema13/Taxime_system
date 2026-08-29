import { timeTrackingTimerService } from './timeTracking-timer.service';
import { timeTrackingEntryService } from './timeTracking-entry.service';

export class TimeTrackingService {
  async startTimer(taskId: string, userId: string, description?: string) {
    return timeTrackingTimerService.startTimer(taskId, userId, description);
  }

  async stopTimer(userId: string) {
    return timeTrackingTimerService.stopTimer(userId);
  }

  async getRunningTimer(userId: string) {
    return timeTrackingTimerService.getRunningTimer(userId);
  }

  async getEntriesByTask(taskId: string) {
    return timeTrackingEntryService.getEntriesByTask(taskId);
  }

  async getEntriesByUser(userId: string, dateFrom?: string, dateTo?: string) {
    return timeTrackingEntryService.getEntriesByUser(userId, dateFrom, dateTo);
  }

  async deleteEntry(entryId: string, userId: string) {
    return timeTrackingEntryService.deleteEntry(entryId, userId);
  }
}

export const timeTrackingService = new TimeTrackingService();
