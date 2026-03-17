import type { FastifyReply, FastifyRequest } from 'fastify';

import { attendanceService } from '../services/attendance.service';
import { studentService } from '../services/student.service';
import type { AttendanceCreateInput, AttendanceListQuery } from '../validators/attendance';

export const attendanceController = {
  async listByStudent(
    _request: FastifyRequest,
    reply: FastifyReply,
    studentId: string,
    query: AttendanceListQuery,
  ) {
    const student = await studentService.getById(studentId);
    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const records = await attendanceService.listByStudent(studentId, query);
    return reply.send({ data: records });
  },

  async createForStudent(
    _request: FastifyRequest,
    reply: FastifyReply,
    studentId: string,
    input: AttendanceCreateInput,
  ) {
    const student = await studentService.getById(studentId);
    if (!student) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const created = await attendanceService.createForStudent(studentId, input);
    return reply.status(201).send({ data: created });
  },
};
