import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../prisma/client';
import { timetableService } from '../services/timetable.service';
import type { TimetableCreateInput, TimetableQuery } from '../validators/timetable';

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  return hours * 60 + minutes;
}

export const timetableController = {
  async createEntry(_request: FastifyRequest, reply: FastifyReply, input: TimetableCreateInput) {
    if (toMinutes(input.startTime) >= toMinutes(input.endTime)) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Start time must be earlier than end time.',
      });
    }

    const created = await timetableService.createEntry(input);
    return reply.status(201).send({ data: created });
  },

  async getMySchedule(
    request: FastifyRequest,
    reply: FastifyReply,
    query: TimetableQuery,
  ) {
    const user = request.user;
    if (!user) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing authentication' });
    }

    if (user.role === 'ADMIN') {
      const where = query.gradeLevel ? { gradeLevel: query.gradeLevel } : {};
      const data = await timetableService.listSchedule(where);
      return reply.send({ data });
    }

    if (user.role === 'TEACHER') {
      if (!user.id) {
        return reply.status(401).send({ error: 'unauthorized', message: 'Missing teacher identity' });
      }
      const data = await timetableService.listSchedule({ teacherId: user.id });
      return reply.send({ data });
    }

    const email = user.email?.trim();
    if (!email) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const student = await prisma.student.findFirst({
      where: { email: { equals: email, mode: 'insensitive' }, deletedAt: null },
      select: { id: true, gradeLevel: true },
    });

    if (!student || !student.gradeLevel) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const data = await timetableService.listSchedule({ gradeLevel: student.gradeLevel });
    return reply.send({ data });
  },
};
