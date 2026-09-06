import { z } from 'zod';
import { UserType } from '../types/user.types';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  user_type: z.nativeEnum(UserType)
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email('Invalid email').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  user_type: z.nativeEnum(UserType).optional(),
  is_active: z.boolean().optional()
});
