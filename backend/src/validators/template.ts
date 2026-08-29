import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  taskDescription: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  category: z.enum([
    'OPERATIONS', 'ADMINISTRATION', 'FINANCE', 'HR', 'IT',
    'MAINTENANCE', 'CUSTOMER_SUPPORT', 'MARKETING',
    'DOCUMENTATION', 'MANAGEMENT', 'OTHER',
  ]).default('OTHER'),
  estimatedHours: z.number().positive().optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  title: z.string().min(1).max(200).optional(),
  taskDescription: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  category: z.enum([
    'OPERATIONS', 'ADMINISTRATION', 'FINANCE', 'HR', 'IT',
    'MAINTENANCE', 'CUSTOMER_SUPPORT', 'MARKETING',
    'DOCUMENTATION', 'MANAGEMENT', 'OTHER',
  ]).optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
});
