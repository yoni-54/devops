import { z } from 'zod';

export const userIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a valid number').transform(Number),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(255, 'Name must be less than 255 characters').trim().optional(),
  email: z.string().email('Invalid email format').max(255, 'Email must be less than 255 characters').toLowerCase().trim().optional(),
  role: z.enum(['user', 'admin'], 'Role must be either user or admin').optional(),
});