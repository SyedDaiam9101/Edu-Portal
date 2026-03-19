import { z } from 'zod';

export const submissionCreateInputSchema = z
  .object({
    assignmentId: z.string().trim().min(1),
    content: z.string().trim().min(1).max(4000),
  })
  .strict();

export type SubmissionCreateInput = z.infer<typeof submissionCreateInputSchema>;
