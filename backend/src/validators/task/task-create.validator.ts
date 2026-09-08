import { z } from 'zod';

const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  priority: z.enum(validPriorities),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  estimatedHours: z.number().positive().optional(),
  teamId: z.string().uuid().nullable().optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
  primaryAssigneeId: z.string().uuid().optional(),
  location: z.string().optional(),
  vehicleReference: z.string().optional(),
  customerReference: z.string().optional(),
  externalRef: z.string().optional(),
  templateId: z.string().uuid().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceType: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']).optional(),
  recurrenceEnd: z.string().datetime().optional(),
});

export const createFromTemplateSchema = z.object({
  templateId: z.string().uuid('Invalid template ID'),
  dueDate: z.string().datetime().optional(),
  assigneeIds: z.array(z.string().uuid()).optional(),
  primaryAssigneeId: z.string().uuid().optional(),
  departmentId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200).optional(),
});
