import { z } from 'zod';

import { loadDotenv } from './dotenv';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3001),
  LOG_LEVEL: z.string().default('info'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  DATABASE_URL: z.string().optional(),

  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  // JWT (HS256). Used for user authentication in production.
  JWT_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(overrides?: Record<string, string | undefined>): Env {
  return envSchema.parse({ ...process.env, ...overrides });
}

export const env = loadEnv();
