import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';

const studentSelect = {
  id: true,
  rollNumber: true,
  firstName: true,
  lastName: true,
  email: true,
  gradeLevel: true,
  section: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.StudentSelect;

export const teacherService = {
  async listStudentsByGrade(gradeLevel: string) {
    return prisma.student.findMany({
      where: { gradeLevel, status: 'ACTIVE', deletedAt: null },
      orderBy: { lastName: 'asc' },
      select: studentSelect,
    });
  },
};
