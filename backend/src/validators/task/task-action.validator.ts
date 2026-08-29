import { z } from 'zod';

const validStatuses = [
  'DRAFT', 'PENDING', 'ACCEPTED', 'IN_PROGRESS',
  'SUBMITTED_FOR_REVIEW', 'UNDER_REVIEW', 'COMPLETED',
  'REJECTED', 'ON_HOLD', 'CANCELLED', 'OVERDUE',
] as const;

export const assignTaskSchema = z.object({
  assigneeIds: z.array(z.string().uuid()).min(1, 'At least one assignee is required'),
  primaryAssigneeId: z.string().uuid().optional(),
});

export const statusChangeSchema = z.object({
  status: z.enum(validStatuses),
});

export const subtaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  assigneeIds: z.array(z.string().uuid()).optional(),
});

export const dependencySchema = z.object({
  dependsOnId: z.string().uuid('Invalid task ID'),
});
