import { prisma } from '../prisma/client';

type AdminStats = {
  totalStudents: number;
  attendanceRateToday: number;
  presentToday: number;
  feesCollectedMonth: string;
};

function startOfToday() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfNextDay(date: Date) {
  const next = new Date(date);
  next.setDate(date.getDate() + 1);
  return next;
}

function startOfMonth(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfNextMonth(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

export const adminStatsService = {
  async getStats(): Promise<AdminStats> {
    const todayStart = startOfToday();
    const todayEnd = startOfNextDay(todayStart);
    const monthStart = startOfMonth(todayStart);
    const nextMonthStart = startOfNextMonth(todayStart);

    const [totalStudents, presentToday, feesAggregate] = await Promise.all([
      prisma.student.count({
        where: { status: 'ACTIVE', deletedAt: null },
      }),
      prisma.attendance.count({
        where: {
          status: 'PRESENT',
          date: { gte: todayStart, lt: todayEnd },
          student: { status: 'ACTIVE', deletedAt: null },
        },
        distinct: ['studentId'],
      }),
      prisma.fee.aggregate({
        _sum: { amount: true },
        where: {
          status: 'PAID',
          paidAt: { gte: monthStart, lt: nextMonthStart },
        },
      }),
    ]);

    const attendanceRateToday = totalStudents
      ? Math.round((presentToday / totalStudents) * 1000) / 10
      : 0;
    const feesCollectedMonth = feesAggregate._sum.amount?.toString() ?? '0';

    return {
      totalStudents,
      attendanceRateToday,
      presentToday,
      feesCollectedMonth,
    };
  },
};
