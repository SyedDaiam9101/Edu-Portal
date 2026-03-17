import { z } from 'zod';

export const feeStatusSchema = z.enum(['DUE', 'PAID', 'OVERDUE', 'WAIVED']);

export const feeCreateInputSchema = z
  .object({
    amount: z.coerce.number().positive(),
    currency: z.string().trim().min(3).max(8).optional(),
    dueDate: z.coerce.date(),
    status: feeStatusSchema.optional(),
  })
  .strict();

export const feeListQuerySchema = z
  .object({
    take: z.coerce.number().int().min(1).max(200).default(60),
    status: feeStatusSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict();

export type FeeCreateInput = z.infer<typeof feeCreateInputSchema>;
export type FeeListQuery = z.infer<typeof feeListQuerySchema>;
