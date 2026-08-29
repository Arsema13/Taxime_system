import { z } from 'zod';

const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const validCategories = [
  'OPERATIONS', 'ADMINISTRATION', 'FINANCE', 'HR', 'IT',
  'MAINTENANCE', 'CUSTOMER_SUPPORT', 'MARKETING',
  'DOCUMENTATION', 'MANAGEMENT', 'OTHER',
] as const;
const validStatuses = [
  'DRAFT', 'PENDING', 'ACCEPTED', 'IN_PROGRESS',
  'SUBMITTED_FOR_REVIEW', 'UNDER_REVIEW', 'COMPLETED',
  'REJECTED', 'ON_HOLD', 'CANCELLED', 'OVERDUE',
] as const;

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priority: z.enum(validPriorities).optional(),
  category: z.enum(validCategories).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  progress: z.number().min(0).max(100).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  location: z.string().optional(),
  vehicleReference: z.string().optional(),
  customerReference: z.string().optional(),
  externalRef: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export const bulkTaskSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1, 'At least one task is required'),
  action: z.enum(['assign', 'status', 'priority', 'archive', 'unarchive', 'delete']),
  data: z.object({
    assigneeIds: z.array(z.string().uuid()).optional(),
    primaryAssigneeId: z.string().uuid().optional(),
    status: z.enum(validStatuses).optional(),
    priority: z.enum(validPriorities).optional(),
  }).optional(),
});
