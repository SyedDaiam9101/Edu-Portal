import { z } from 'zod';

export const announcementCreateInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1).max(1000),
    audience: z.enum(['GLOBAL', 'TEACHERS', 'STUDENTS']),
  })
  .strict();

export type AnnouncementCreateInput = z.infer<typeof announcementCreateInputSchema>;
