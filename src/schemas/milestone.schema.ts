import { z } from 'zod';
import { MilestoneStatus } from '../types/milestone.types';

export const createMilestoneSchema = z.object({
  project_id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1).optional(),
  due_date: z.coerce.date().optional()
});

export const updateMilestoneSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  due_date: z.coerce.date().optional(),
  status: z.nativeEnum(MilestoneStatus).optional()
});
