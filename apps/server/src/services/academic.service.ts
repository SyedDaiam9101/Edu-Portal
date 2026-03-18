import type { Prisma } from '@prisma/client';

import { prisma } from '../prisma/client';
import type {
  ExamCreateInput,
  ExamListQuery,
  ExamResultInput,
  SubjectCreateInput,
} from '../validators/academic';

const subjectSelect = {
  id: true,
  name: true,
  gradeLevel: true,
} satisfies Prisma.SubjectSelect;

const examSelect = {
  id: true,
  name: true,
  term: true,
  date: true,
  maxScore: true,
  gradeLevel: true,
  subjectId: true,
  subject: {
    select: {
      id: true,
      name: true,
      gradeLevel: true,
    },
  },
} satisfies Prisma.ExamSelect;

const examResultSelect = {
  id: true,
  studentId: true,
  examId: true,
  score: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ExamResultSelect;

const examResultWithExamSelect = {
  id: true,
  studentId: true,
  score: true,
  createdAt: true,
  updatedAt: true,
  exam: {
    select: {
      id: true,
      name: true,
      term: true,
      date: true,
      maxScore: true,
      gradeLevel: true,
      subject: {
        select: {
          id: true,
          name: true,
          gradeLevel: true,
        },
      },
    },
  },
} satisfies Prisma.ExamResultSelect;

export const academicService = {
  async createSubject(input: SubjectCreateInput) {
    return prisma.subject.create({
      data: {
        name: input.name,
        gradeLevel: input.gradeLevel,
      },
      select: subjectSelect,
    });
  },

  async createExam(input: ExamCreateInput) {
    return prisma.exam.create({
      data: {
        name: input.name,
        term: input.term ?? null,
        date: input.date,
        maxScore: input.maxScore,
        gradeLevel: input.gradeLevel,
        subjectId: input.subjectId,
      },
      select: examSelect,
    });
  },

  async getExamMaxScore(examId: string) {
    return prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, maxScore: true },
    });
  },

  async createExamResult(studentId: string, input: ExamResultInput) {
    return prisma.examResult.create({
      data: {
        studentId,
        examId: input.examId,
        score: input.score,
      },
      select: examResultWithExamSelect,
    });
  },

  async listResultsByStudent(studentId: string) {
    return prisma.examResult.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      select: examResultWithExamSelect,
    });
  },

  async listExams(query: ExamListQuery) {
    const where: Prisma.ExamWhereInput = {};
    if (query.gradeLevel) where.gradeLevel = query.gradeLevel;
    if (query.subjectId) where.subjectId = query.subjectId;

    return prisma.exam.findMany({
      where,
      orderBy: { date: 'desc' },
      take: query.take,
      select: examSelect,
    });
  },
};
