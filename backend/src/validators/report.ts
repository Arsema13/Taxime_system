import { z } from 'zod';

export const reportQuerySchema = z.object({
  type: z.enum([
    'task_summary', 'employee_performance', 'team_performance',
    'department_report', 'overdue_report', 'task_history',
    'completion_timeline',
  ]),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum([
    'DRAFT', 'PENDING', 'ACCEPTED', 'IN_PROGRESS',
    'SUBMITTED_FOR_REVIEW', 'UNDER_REVIEW', 'COMPLETED',
    'REJECTED', 'ON_HOLD', 'CANCELLED', 'OVERDUE',
  ]).optional(),
  format: z.enum(['json', 'pdf', 'excel']).default('json'),
});
