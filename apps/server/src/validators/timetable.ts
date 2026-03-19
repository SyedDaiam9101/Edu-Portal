import { z } from 'zod';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timetableCreateInputSchema = z
  .object({
    dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
    startTime: z.string().regex(timePattern, 'Start time must be HH:MM (24h)'),
    endTime: z.string().regex(timePattern, 'End time must be HH:MM (24h)'),
    subjectId: z.string().trim().min(1),
    teacherId: z.string().trim().min(1),
    gradeLevel: z.string().trim().min(1).max(32),
    roomNumber: z.string().trim().min(1).max(32),
  })
  .strict();

export const timetableQuerySchema = z
  .object({
    gradeLevel: z.string().trim().min(1).max(32).optional(),
  })
  .strict();

export type TimetableCreateInput = z.infer<typeof timetableCreateInputSchema>;
export type TimetableQuery = z.infer<typeof timetableQuerySchema>;
