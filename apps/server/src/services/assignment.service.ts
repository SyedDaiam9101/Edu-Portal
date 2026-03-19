import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';
import type { AssignmentCreateInput } from '../validators/assignment';

const assignmentSelect = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  gradeLevel: true,
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
  createdAt: true,
} satisfies Prisma.AssignmentSelect;

const assignmentWithSubmissionSelect = {
  ...assignmentSelect,
  submissions: {
    select: {
      id: true,
      status: true,
      createdAt: true,
    },
  },
} satisfies Prisma.AssignmentSelect;

export const assignmentService = {
  async createAssignment(teacherId: string, input: AssignmentCreateInput) {
    return prisma.assignment.create({
      data: {
        title: input.title,
        description: input.description,
        dueDate: input.dueDate,
        subjectId: input.subjectId,
        teacherId,
        gradeLevel: input.gradeLevel,
      },
      select: assignmentSelect,
    });
  },

  async listByGrade(gradeLevel: string) {
    return prisma.assignment.findMany({
      where: { gradeLevel },
      orderBy: { dueDate: 'asc' },
      select: assignmentSelect,
    });
  },

  async listByGradeForStudent(gradeLevel: string, studentId: string) {
    return prisma.assignment.findMany({
      where: { gradeLevel },
      orderBy: { dueDate: 'asc' },
      select: {
        ...assignmentWithSubmissionSelect,
        submissions: {
          where: { studentId },
          select: { id: true, status: true, createdAt: true },
        },
      },
    });
  },
};
