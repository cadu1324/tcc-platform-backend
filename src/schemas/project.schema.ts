import { z } from 'zod';
import { ProjectStatus } from '../types/project.types';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  student_id: z.number().int().positive(),
  advisor_id: z.number().int().positive(),
  knowledge_area: z.string().min(1, 'Knowledge area is required'),
  start_date: z.coerce.date().optional(),
  expected_delivery_date: z.coerce.date().optional()
});

export const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  advisor_id: z.number().int().positive().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  expected_delivery_date: z.coerce.date().optional(),
  knowledge_area: z.string().min(1).optional()
});
