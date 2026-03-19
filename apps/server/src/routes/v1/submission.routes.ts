import type { FastifyPluginAsync } from 'fastify';

import { submissionController } from '../../controllers/submission.controller';
import { requireRole } from '../../middleware/auth.middleware';
import { submissionCreateInputSchema } from '../../validators/submission';
import { studentIdSchema } from '../../validators/student';

export const submissionRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/hand-in',
    { preHandler: requireRole(['STUDENT']) },
    async (request, reply) => {
      const body = submissionCreateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }
      return submissionController.handInWork(request, reply, body.data);
    },
  );

  app.get(
    '/teacher',
    { preHandler: requireRole(['TEACHER']) },
    async (request, reply) => submissionController.listForTeacher(request, reply),
  );

  app.post(
    '/:id/grade',
    { preHandler: requireRole(['TEACHER']) },
    async (request, reply) => {
      const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
      if (!id.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid submission id',
          issues: id.error.issues,
        });
      }
      return submissionController.markAsGraded(request, reply, id.data);
    },
  );
};
