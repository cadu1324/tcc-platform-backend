import { z } from 'zod';
import { DeliveryStatus } from '../types/project.types';

export const createDeliverySchema = z.object({
  project_id: z.number().int().positive(),
  milestone_id: z.number().int().positive('Milestone is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  deadline: z.coerce.date().optional()
});

export const updateDeliverySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  deadline: z.coerce.date().optional(),
  status: z.nativeEnum(DeliveryStatus).optional(),
  file_url: z.string().min(1).optional(),
  file_name: z.string().min(1).optional(),
  submitted_at: z.coerce.date().optional()
});
