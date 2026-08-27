import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const fileUpdateSchema = z.object({
  originalName: z
    .string()
    .min(1, 'Filename is required')
    .max(255, 'Filename is too long')
    .optional(),
  isPublic: z
    .boolean()
    .optional(),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(Number)
    .pipe(z.number().int().positive().max(100)),
  search: z
    .string()
    .optional(),
  isPublic: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  trash: z
    .string()
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type FileUpdateInput = z.infer<typeof fileUpdateSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;