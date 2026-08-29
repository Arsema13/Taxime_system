import { z } from 'zod';

const validStatuses = [
  'DRAFT', 'PENDING', 'ACCEPTED', 'IN_PROGRESS',
  'SUBMITTED_FOR_REVIEW', 'UNDER_REVIEW', 'COMPLETED',
  'REJECTED', 'ON_HOLD', 'CANCELLED', 'OVERDUE',
] as const;
const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
const validCategories = [
  'OPERATIONS', 'ADMINISTRATION', 'FINANCE', 'HR', 'IT',
  'MAINTENANCE', 'CUSTOMER_SUPPORT', 'MARKETING',
  'DOCUMENTATION', 'MANAGEMENT', 'OTHER',
] as const;

export const taskQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  search: z.string().optional(),
  status: z.enum(validStatuses).optional(),
  priority: z.enum(validPriorities).optional(),
  category: z.enum(validCategories).optional(),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  creatorId: z.string().uuid().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  isArchived: z.string().optional(),
  tags: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
