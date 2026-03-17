import type { FastifyReply, FastifyRequest } from 'fastify';

import { feeService } from '../services/fee.service';
import { studentService } from '../services/student.service';
import type { FeeCreateInput, FeeListQuery } from '../validators/fee';

export const feeController = {
  async listByStudent(
    _request: FastifyRequest,
    reply: FastifyReply,
    studentId: string,
    query: FeeListQuery,
  ) {
    const student = await studentService.getById(studentId);
    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const fees = await feeService.listByStudent(studentId, query);
    return reply.send({ data: fees });
  },

  async createForStudent(
    _request: FastifyRequest,
    reply: FastifyReply,
    studentId: string,
    input: FeeCreateInput,
  ) {
    const student = await studentService.getById(studentId);
    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const created = await feeService.createForStudent(studentId, input);
    return reply.status(201).send({ data: created });
  },

  async markPaid(
    _request: FastifyRequest,
    reply: FastifyReply,
    studentId: string,
    feeId: string,
  ) {
    const student = await studentService.getById(studentId);
    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const updated = await feeService.markPaid(studentId, feeId);
    if (!updated) {
      return reply.status(404).send({ error: 'not_found', message: 'Fee not found' });
    }

    return reply.send({ data: updated });
  },
};
