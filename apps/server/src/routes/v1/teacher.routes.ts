import type { FastifyPluginAsync } from 'fastify';

import { teacherController } from '../../controllers/teacher.controller';
import { requireRole } from '../../middleware/auth.middleware';
import { bulkAttendanceInputSchema } from '../../validators/teacher';
import { studentIdSchema } from '../../validators/student';

export const teacherRoutes: FastifyPluginAsync = async (app) => {
  app.get('/class-list', { preHandler: requireRole(['TEACHER']) }, async (request, reply) =>
    teacherController.listMyStudents(request, reply),
  );

  app.post(
    '/bulk-attendance',
    { preHandler: requireRole(['TEACHER']) },
    async (request, reply) => {
      const body = bulkAttendanceInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }
      return teacherController.markBulkAttendance(request, reply, body.data);
    },
  );

  app.get(
    '/class-attendance-today',
    { preHandler: requireRole(['TEACHER']) },
    async (request, reply) => teacherController.getClassAttendanceToday(request, reply),
  );

  app.get(
    '/students/:id/results',
    { preHandler: requireRole(['TEACHER']) },
    async (request, reply) => {
      const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
      if (!id.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid student id',
          issues: id.error.issues,
        });
      }

      return teacherController.getStudentResults(request, reply, id.data);
    },
  );
};
