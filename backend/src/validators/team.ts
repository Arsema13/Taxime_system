import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  departmentId: z.string().uuid('Invalid department ID'),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  departmentId: z.string().uuid().optional(),
});

export const addTeamMemberSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const teamQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  departmentId: z.string().uuid().optional(),
  search: z.string().optional(),
});
