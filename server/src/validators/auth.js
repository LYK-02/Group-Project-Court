import { z } from 'zod';

export const registerSchema = z.object({
  displayName: z
    .string({ required_error: 'Display name is required.' })
    .trim()
    .min(2, 'Display name must be at least 2 characters long.')
    .max(60, 'Display name must not exceed 60 characters.'),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format.')
    .max(254, 'Email must not exceed 254 characters.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters long.')
    .max(100, 'Password must not exceed 100 characters.'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Invalid email address format.'),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.')
    .max(100),
});
