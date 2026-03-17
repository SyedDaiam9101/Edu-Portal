import { z } from 'zod';

export const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'LATE']);

export const attendanceCreateInputSchema = z
  .object({
    status: attendanceStatusSchema,
    date: z.coerce.date().optional(),
  })
  .strict();

export const attendanceListQuerySchema = z
  .object({
    take: z.coerce.number().int().min(1).max(200).default(60),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict();

export type AttendanceCreateInput = z.infer<typeof attendanceCreateInputSchema>;
export type AttendanceListQuery = z.infer<typeof attendanceListQuerySchema>;
