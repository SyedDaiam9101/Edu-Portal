import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';
import type { FeeCreateInput, FeeListQuery } from '../validators/fee';

const baseSelect = {
  id: true,
  amount: true,
  currency: true,
  dueDate: true,
  status: true,
  paidAt: true,
  studentId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FeeSelect;

export const feeService = {
  async listByStudent(studentId: string, query: FeeListQuery) {
    const where: Prisma.FeeWhereInput = { studentId };
    if (query.status) where.status = query.status;
    if (query.from || query.to) {
      where.dueDate = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      };
    }

    return prisma.fee.findMany({
      where,
      orderBy: { dueDate: 'desc' },
      take: query.take,
      select: baseSelect,
    });
  },

  async listUnpaidByStudent(studentId: string) {
    return prisma.fee.findMany({
      where: { studentId, status: { in: ['DUE', 'OVERDUE'] } },
      orderBy: { dueDate: 'desc' },
      select: baseSelect,
    });
  },

  async createForStudent(studentId: string, input: FeeCreateInput) {
    return prisma.fee.create({
      data: {
        studentId,
        amount: input.amount,
        currency: input.currency ?? 'USD',
        dueDate: input.dueDate,
        status: input.status ?? 'DUE',
      },
      select: baseSelect,
    });
  },

  async markPaid(studentId: string, feeId: string, paidAt = new Date()) {
    const existing = await prisma.fee.findFirst({
      where: { id: feeId, studentId },
      select: { id: true },
    });
    if (!existing) return null;

    return prisma.fee.update({
      where: { id: feeId },
      data: { status: 'PAID', paidAt },
      select: baseSelect,
    });
  },
};
