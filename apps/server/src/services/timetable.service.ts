import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';
import type { TimetableCreateInput, TimetableQuery } from '../validators/timetable';

const entrySelect = {
  id: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  gradeLevel: true,
  roomNumber: true,
  subject: {
    select: {
      id: true,
      name: true,
    },
  },
  teacher: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.TimetableEntrySelect;

export const timetableService = {
  async createEntry(input: TimetableCreateInput) {
    return prisma.timetableEntry.create({
      data: {
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        subjectId: input.subjectId,
        teacherId: input.teacherId,
        gradeLevel: input.gradeLevel,
        roomNumber: input.roomNumber,
      },
      select: entrySelect,
    });
  },

  async listSchedule(where: Prisma.TimetableEntryWhereInput) {
    return prisma.timetableEntry.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      select: entrySelect,
    });
  },
};
