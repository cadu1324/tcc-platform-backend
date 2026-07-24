import { z } from 'zod';

export const createFeedbackSchema = z.object({
  delivery_id: z.number().int().positive(),
  comment: z.string().min(1, 'Comment is required'),
  grade: z.number().min(0, 'Grade must be between 0 and 10').max(10, 'Grade must be between 0 and 10')
});
