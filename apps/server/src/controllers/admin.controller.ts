import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../prisma/client';

const MONTH_LABELS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function monthKey(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

export const adminController = {
  async getRevenueAnalytics(
    _request: FastifyRequest,
    reply: FastifyReply,
    gradeLevel?: string,
  ) {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const start = addMonths(currentMonthStart, -5);
    const end = addMonths(currentMonthStart, 1);

    const fees = await prisma.fee.findMany({
      where: {
        status: 'PAID',
        paidAt: { gte: start, lt: end },
        ...(gradeLevel
          ? {
              student: {
                gradeLevel,
                deletedAt: null,
              },
            }
          : {}),
      },
      select: { amount: true, paidAt: true },
    });

    const buckets = new Map<string, number>();
    for (let i = 0; i < 6; i += 1) {
      const monthDate = addMonths(start, i);
      buckets.set(monthKey(monthDate), 0);
    }

    for (const fee of fees) {
      if (!fee.paidAt) continue;
      const key = monthKey(fee.paidAt);
      if (!buckets.has(key)) continue;
      const amount = Number(fee.amount);
      buckets.set(key, (buckets.get(key) ?? 0) + (Number.isFinite(amount) ? amount : 0));
    }

    const data = Array.from(buckets.entries()).map(([key, value]) => {
      const [, month] = key.split('-');
      const label = MONTH_LABELS[Number(month) - 1] ?? key;
      return { month: label, revenue: Math.round(value * 100) / 100 };
    });

    return reply.send({ data });
  },
};
