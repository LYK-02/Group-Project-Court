import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().optional().default('postgresql://postgres:postgres@localhost:5432/group_project_court'),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  NEON_BRANCH: z.string().optional(),
  TEST_DATABASE_URL: z.string().optional().default('postgresql://postgres:postgres@localhost:5432/group_project_court_test'),
  SESSION_SECRET: z.string().min(16).default('development-secret-must-be-min-16-characters-long'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[config/env] Invalid environment configuration:', parsed.error.format());
  throw new Error('Environment configuration validation failed.');
}

export const env = parsed.data;
