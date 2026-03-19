import type { FastifyPluginAsync } from 'fastify';

import { assignmentController } from '../../controllers/assignment.controller';
import { requireRole } from '../../middleware/auth.middleware';
import { assignmentCreateInputSchema } from '../../validators/assignment';

export const assignmentRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/',
    { preHandler: requireRole(['TEACHER']) },
    async (request, reply) => {
      const body = assignmentCreateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }
      return assignmentController.postAssignment(request, reply, body.data);
    },
  );

  app.get(
    '/my',
    { preHandler: requireRole(['STUDENT']) },
    async (request, reply) => assignmentController.getMyAssignments(request, reply),
  );
};
