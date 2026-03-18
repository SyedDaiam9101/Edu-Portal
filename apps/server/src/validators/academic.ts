import { z } from 'zod';

export const subjectCreateInputSchema = z
  .object({
    name: z.string().trim().min(1).max(128),
    gradeLevel: z.string().trim().min(1).max(32),
  })
  .strict();

export const examCreateInputSchema = z
  .object({
    name: z.string().trim().min(1).max(128),
    term: z.string().trim().min(1).max(64).optional(),
    date: z.coerce.date(),
    maxScore: z.coerce.number().min(1),
    gradeLevel: z.string().trim().min(1).max(32),
    subjectId: z.string().trim().min(1),
  })
  .strict();

export const examResultInputSchema = z
  .object({
    examId: z.string().trim().min(1),
    score: z.coerce.number().min(0),
  })
  .strict();

export const examListQuerySchema = z
  .object({
    gradeLevel: z.string().trim().min(1).max(32).optional(),
    subjectId: z.string().trim().min(1).optional(),
    take: z.coerce.number().int().min(1).max(200).default(100),
  })
  .strict();

export type SubjectCreateInput = z.infer<typeof subjectCreateInputSchema>;
export type ExamCreateInput = z.infer<typeof examCreateInputSchema>;
export type ExamResultInput = z.infer<typeof examResultInputSchema>;
export type ExamListQuery = z.infer<typeof examListQuerySchema>;
