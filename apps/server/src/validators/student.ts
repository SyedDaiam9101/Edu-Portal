import { z } from 'zod';

export const studentIdSchema = z.string().min(1);

export const studentCreateInputSchema = z
  .object({
    rollNumber: z.string().trim().min(1).max(32),
    firstName: z.string().trim().min(1).max(64),
    lastName: z.string().trim().min(1).max(64),
    email: z.string().trim().email().max(254).nullable().optional(),
    gradeLevel: z.string().trim().min(1).max(16).nullable().optional(),
    section: z.string().trim().min(1).max(8).nullable().optional(),
    guardianName: z.string().trim().min(1).max(128).nullable().optional(),
    guardianPhone: z.string().trim().min(1).max(32).nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  })
  .strict();

export const studentUpdateInputSchema = studentCreateInputSchema
  .partial()
  .omit({ rollNumber: true })
  .strict();

export const studentListQuerySchema = z
  .object({
    take: z.coerce.number().int().min(1).max(100).default(25),
    cursor: z.string().min(1).optional(),
    q: z.string().trim().min(1).max(128).optional(),
    includeArchived: z.coerce.boolean().optional().default(false),
  })
  .strict();

export type StudentCreateInput = z.infer<typeof studentCreateInputSchema>;
export type StudentUpdateInput = z.infer<typeof studentUpdateInputSchema>;
export type StudentListQuery = z.infer<typeof studentListQuerySchema>;
