import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';
import type { AttendanceCreateInput, AttendanceListQuery } from '../validators/attendance';

const baseSelect = {
  id: true,
  date: true,
  status: true,
  studentId: true,
} satisfies Prisma.AttendanceSelect;

export const attendanceService = {
  async listByStudent(studentId: string, query: AttendanceListQuery) {
    const where: Prisma.AttendanceWhereInput = { studentId };
    if (query.from || query.to) {
      where.date = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      };
    }

    return prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take: query.take,
      select: baseSelect,
    });
  },

  async createForStudent(studentId: string, input: AttendanceCreateInput) {
    return prisma.attendance.create({
      data: {
        studentId,
        status: input.status,
        date: input.date ?? new Date(),
      },
      select: baseSelect,
    });
  },
};
