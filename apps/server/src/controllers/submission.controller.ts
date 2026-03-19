import { Prisma } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../prisma/client';
import { studentService } from '../services/student.service';
import { submissionService } from '../services/submission.service';
import type { SubmissionCreateInput } from '../validators/submission';

export const submissionController = {
  async handInWork(
    request: FastifyRequest,
    reply: FastifyReply,
    input: SubmissionCreateInput,
  ) {
    const email = request.user?.email?.trim();
    if (!email) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const student = await studentService.getByEmail(email);
    if (!student || !student.gradeLevel) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: input.assignmentId },
      select: { id: true, gradeLevel: true },
    });

    if (!assignment) {
      return reply.status(404).send({ error: 'not_found', message: 'Assignment not found' });
    }

    if (assignment.gradeLevel !== student.gradeLevel) {
      return reply.status(403).send({
        error: 'forbidden',
        message: 'This assignment is not available for your grade.',
      });
    }

    try {
      const created = await submissionService.createSubmission(student.id, input);
      return reply.status(201).send({ data: created });
    } catch (error) {
      const conflict = asUniqueConflict(error);
      if (conflict) {
        return reply.status(409).send({
          error: 'conflict',
          message: 'You have already submitted this assignment.',
        });
      }
      throw error;
    }
  },

  async listForTeacher(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing teacher identity' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, gradeLevel: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return reply.status(403).send({ error: 'forbidden', message: 'Teacher access required' });
    }

    if (!teacher.gradeLevel) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Teacher has no assigned grade.',
      });
    }

    const submissions = await submissionService.listForTeacherGrade(teacher.gradeLevel);
    return reply.send({ data: submissions });
  },

  async markAsGraded(request: FastifyRequest, reply: FastifyReply, submissionId: string) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing teacher identity' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, gradeLevel: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return reply.status(403).send({ error: 'forbidden', message: 'Teacher access required' });
    }

    if (!teacher.gradeLevel) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Teacher has no assigned grade.',
      });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        status: true,
        assignment: { select: { gradeLevel: true } },
      },
    });

    if (!submission) {
      return reply.status(404).send({ error: 'not_found', message: 'Submission not found' });
    }

    if (submission.assignment.gradeLevel !== teacher.gradeLevel) {
      return reply.status(403).send({
        error: 'forbidden',
        message: 'This submission is not in your assigned class.',
      });
    }

    if (submission.status === 'GRADED') {
      return reply.send({ data: submission });
    }

    const updated = await submissionService.markAsGraded(submissionId);
    return reply.send({ data: updated });
  },
};

function asUniqueConflict(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  return error.code === 'P2002';
}
