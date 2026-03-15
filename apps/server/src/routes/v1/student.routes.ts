import type { FastifyPluginAsync } from 'fastify';

import { studentController } from '../../controllers/student.controller';
import { requireRole } from '../../middleware/auth.middleware';
import {
  studentCreateInputSchema,
  studentIdSchema,
  studentListQuerySchema,
  studentUpdateInputSchema,
} from '../../validators/student';

export const studentRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/',
    { preHandler: requireRole(['ADMIN', 'TEACHER', 'STUDENT']) },
    async (request, reply) => {
    const query = studentListQuerySchema.safeParse(request.query);
    if (!query.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Invalid query params',
        issues: query.error.issues,
      });
    }
    return studentController.list(request, reply, query.data);
    },
  );

  app.post('/', { preHandler: requireRole(['ADMIN', 'TEACHER']) }, async (request, reply) => {
    const body = studentCreateInputSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Invalid request body',
        issues: body.error.issues,
      });
    }
    return studentController.create(request, reply, body.data);
  });

  app.get(
    '/:id',
    { preHandler: requireRole(['ADMIN', 'TEACHER', 'STUDENT']) },
    async (request, reply) => {
    const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
    if (!id.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Invalid student id',
        issues: id.error.issues,
      });
    }
    return studentController.getById(request, reply, id.data);
    },
  );

  app.patch(
    '/:id',
    { preHandler: requireRole(['ADMIN', 'TEACHER']) },
    async (request, reply) => {
    const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
    if (!id.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Invalid student id',
        issues: id.error.issues,
      });
    }

    const body = studentUpdateInputSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Invalid request body',
        issues: body.error.issues,
      });
    }

    return studentController.update(request, reply, id.data, body.data);
    },
  );

  app.delete(
    '/:id',
    { preHandler: requireRole(['ADMIN', 'TEACHER']) },
    async (request, reply) => {
    const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
    if (!id.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Invalid student id',
        issues: id.error.issues,
      });
    }
    return studentController.remove(request, reply, id.data);
    },
  );
};
