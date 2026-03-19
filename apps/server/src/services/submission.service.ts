import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';
import type { SubmissionCreateInput } from '../validators/submission';

const submissionSelect = {
  id: true,
  content: true,
  status: true,
  createdAt: true,
  assignment: {
    select: {
      id: true,
      title: true,
      dueDate: true,
      gradeLevel: true,
      subject: { select: { id: true, name: true } },
      teacher: { select: { id: true, name: true, email: true } },
    },
  },
  student: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      rollNumber: true,
      gradeLevel: true,
    },
  },
} satisfies Prisma.SubmissionSelect;

export const submissionService = {
  async createSubmission(studentId: string, input: SubmissionCreateInput) {
    return prisma.submission.create({
      data: {
        assignmentId: input.assignmentId,
        studentId,
        content: input.content,
        status: 'PENDING',
      },
      select: submissionSelect,
    });
  },

  async listForTeacherGrade(gradeLevel: string) {
    return prisma.submission.findMany({
      where: { assignment: { gradeLevel } },
      orderBy: { createdAt: 'desc' },
      select: submissionSelect,
    });
  },

  async markAsGraded(submissionId: string) {
    return prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'GRADED' },
      select: submissionSelect,
    });
  },
};
