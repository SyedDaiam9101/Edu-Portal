import { z } from 'zod';

export const bulkAttendanceInputSchema = z
  .object({
    records: z
      .array(
        z
          .object({
            studentId: z.string().trim().min(1),
            status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export type BulkAttendanceInput = z.infer<typeof bulkAttendanceInputSchema>;
