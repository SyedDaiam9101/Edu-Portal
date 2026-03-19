import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../prisma/client';
import { assignmentService } from '../services/assignment.service';
import { studentService } from '../services/student.service';
import type { AssignmentCreateInput } from '../validators/assignment';

export const assignmentController = {
  async postAssignment(
    request: FastifyRequest,
    reply: FastifyReply,
    input: AssignmentCreateInput,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing teacher identity' });
    }

    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!teacher || teacher.role !== 'TEACHER') {
      return reply.status(403).send({ error: 'forbidden', message: 'Teacher access required' });
    }

    const created = await assignmentService.createAssignment(teacher.id, input);
    return reply.status(201).send({ data: created });
  },

  async getMyAssignments(request: FastifyRequest, reply: FastifyReply) {
    const email = request.user?.email?.trim();
    if (!email) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const student = await studentService.getByEmail(email);
    if (!student || !student.gradeLevel) {
      return reply.status(404).send({ error: 'not_found', message: 'Student not found' });
    }

    const assignments = await assignmentService.listByGradeForStudent(student.gradeLevel, student.id);
    return reply.send({ data: assignments });
  },
};
