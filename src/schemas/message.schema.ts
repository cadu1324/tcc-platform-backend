import { z } from 'zod';

export const createMessageSchema = z.object({
  recipient_id: z.number().int().positive(),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(2000, 'Content must be at most 2000 characters')
});
