import { Prisma } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { studentService } from '../services/student.service';
import type { StudentCreateInput, StudentListQuery, StudentUpdateInput } from '../validators/student';

export const studentController = {
  async list(_request: FastifyRequest, reply: FastifyReply, query: StudentListQuery) {
    const result = await studentService.list(query);
    return reply.send(result);
  },

  async create(_request: FastifyRequest, reply: FastifyReply, input: StudentCreateInput) {
    try {
      const created = await studentService.create(input);
      return reply.status(201).send({ data: created });
    } catch (error) {
      const conflict = asUniqueConflict(error);
      if (conflict) {
        return reply.status(409).send({
          error: 'conflict',
          message: `A student with the same ${conflict} already exists.`,
        });
      }
      throw error;
    }
  },

  async getById(_request: FastifyRequest, reply: FastifyReply, id: string) {
    const student = await studentService.getById(id);
    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }
    return reply.send({ data: student });
  },

  async update(
    _request: FastifyRequest,
    reply: FastifyReply,
    id: string,
    input: StudentUpdateInput,
  ) {
    try {
      const updated = await studentService.update(id, input);
      if (!updated) {
        return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
      }
      return reply.send({ data: updated });
    } catch (error) {
      const conflict = asUniqueConflict(error);
      if (conflict) {
        return reply.status(409).send({
          error: 'conflict',
          message: `A student with the same ${conflict} already exists.`,
        });
      }
      throw error;
    }
  },

  async remove(_request: FastifyRequest, reply: FastifyReply, id: string) {
    const removed = await studentService.remove(id);
    if (!removed) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }
    return reply.send({ ok: true });
  },
};

function asUniqueConflict(error: unknown): 'rollNumber' | 'email' | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;
  if (error.code !== 'P2002') return null;
  const target = (error.meta?.target ?? []) as unknown;
  const fields = Array.isArray(target) ? target : [];
  if (fields.includes('rollNumber')) return 'rollNumber';
  if (fields.includes('email')) return 'email';
  return null;
}
