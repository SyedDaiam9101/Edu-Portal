import { Prisma } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { academicService } from '../services/academic.service';
import { examService } from '../services/exam.service';
import { studentService } from '../services/student.service';
import type {
  ExamCreateInput,
  ExamListQuery,
  ExamResultInput,
  SubjectCreateInput,
} from '../validators/academic';

export const academicController = {
  async createSubject(_request: FastifyRequest, reply: FastifyReply, input: SubjectCreateInput) {
    const created = await academicService.createSubject(input);
    return reply.status(201).send({ data: created });
  },

  async createExam(_request: FastifyRequest, reply: FastifyReply, input: ExamCreateInput) {
    try {
      const created = await academicService.createExam(input);
      return reply.status(201).send({ data: created });
    } catch (error) {
      const conflict = asForeignKeyConflict(error);
      if (conflict === 'subjectId') {
        return reply.status(404).send({ error: 'not_found', message: 'Subject not found' });
      }
      throw error;
    }
  },

  async createExamResult(
    _request: FastifyRequest,
    reply: FastifyReply,
    studentId: string,
    input: ExamResultInput,
  ) {
    const student = await studentService.getById(studentId);
    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const exam = await academicService.getExamMaxScore(input.examId);
    if (!exam) {
      return reply.status(404).send({ error: 'not_found', message: 'Exam not found' });
    }

    const maxScore = Number(exam.maxScore);
    if (Number.isFinite(maxScore) && input.score > maxScore) {
      return reply.status(400).send({
        error: 'validation_error',
        message: `Score cannot exceed max score (${maxScore}).`,
      });
    }

    try {
      const created = await academicService.createExamResult(studentId, input);
      return reply.status(201).send({ data: created });
    } catch (error) {
      const conflict = asUniqueConflict(error);
      if (conflict === 'examId') {
        return reply.status(409).send({
          error: 'conflict',
          message: 'Exam result already exists for this student.',
        });
      }
      throw error;
    }
  },

  async listResultsByStudent(_request: FastifyRequest, reply: FastifyReply, studentId: string) {
    const student = await studentService.getById(studentId);
    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const [results, gpa] = await Promise.all([
      academicService.listResultsByStudent(studentId),
      examService.calculateStudentGPA(studentId),
    ]);

    return reply.send({ data: { results, gpa } });
  },

  async listExams(_request: FastifyRequest, reply: FastifyReply, query: ExamListQuery) {
    const exams = await academicService.listExams(query);
    return reply.send({ data: exams });
  },
};

function asUniqueConflict(error: unknown): 'examId' | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;
  if (error.code !== 'P2002') return null;
  const target = (error.meta?.target ?? []) as unknown;
  const fields = Array.isArray(target) ? target : [];
  if (fields.includes('studentId') && fields.includes('examId')) return 'examId';
  return null;
}

function asForeignKeyConflict(error: unknown): 'subjectId' | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;
  if (error.code !== 'P2003') return null;
  const field = String(error.meta?.field_name ?? '');
  if (field.includes('subjectId')) return 'subjectId';
  return null;
}
