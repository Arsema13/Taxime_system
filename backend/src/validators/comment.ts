import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(5000),
  parentId: z.string().uuid().optional(),
  mentions: z.array(z.string().uuid()).optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});
