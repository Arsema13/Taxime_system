import { recurringTaskJob } from './recurringTask.job';
import { overdueCheckJob } from './overdueCheck.job';
import { deadlineReminderJob } from './deadlineReminder.job';
import { taskEscalationJob } from './taskEscalation.job';
import { config } from '../config';

let intervals: NodeJS.Timeout[] = [];

export function startJobScheduler() {
  console.log('[Jobs] Starting job scheduler...');

  intervals.push(
    setInterval(async () => {
      try {
        await recurringTaskJob.processRecurringTasks();
      } catch (e) { console.error('[Jobs] Recurring task error:', e); }
    }, config.jobs.recurringTaskInterval),
  );

  intervals.push(
    setInterval(async () => {
      try {
        const count = await overdueCheckJob.checkOverdueTasks();
        if (count > 0) console.log(`[Jobs] Marked ${count} tasks as overdue`);
      } catch (e) { console.error('[Jobs] Overdue check error:', e); }
    }, config.jobs.overdueCheckInterval),
  );

  intervals.push(
    setInterval(async () => {
      try {
        await deadlineReminderJob.sendDeadlineReminders();
      } catch (e) { console.error('[Jobs] Deadline reminder error:', e); }
    }, config.jobs.deadlineReminderInterval),
  );

  intervals.push(
    setInterval(async () => {
      try {
        await taskEscalationJob.escalateOverdueTasks();
      } catch (e) { console.error('[Jobs] Escalation error:', e); }
    }, config.jobs.escalationInterval),
  );

  console.log('[Jobs] All scheduled jobs started');
}

export function stopJobScheduler() {
  intervals.forEach(clearInterval);
  intervals = [];
  console.log('[Jobs] Job scheduler stopped');
}
