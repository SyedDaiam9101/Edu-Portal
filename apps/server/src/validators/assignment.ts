import { z } from 'zod';

export const assignmentCreateInputSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(2000),
    dueDate: z.coerce.date(),
    subjectId: z.string().trim().min(1),
    gradeLevel: z.string().trim().min(1).max(32),
  })
  .strict();

export type AssignmentCreateInput = z.infer<typeof assignmentCreateInputSchema>;
