import { z } from 'zod';

export const authLoginInputSchema = z
  .object({
    email: z.string().trim().email().max(254),
    password: z.string().min(8).max(256),
  })
  .strict();

export type AuthLoginInput = z.infer<typeof authLoginInputSchema>;

