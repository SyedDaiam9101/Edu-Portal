import type { FastifyPluginAsync } from 'fastify';

import { timetableController } from '../../controllers/timetable.controller';
import { requireRole } from '../../middleware/auth.middleware';
import { APP_ROLES } from '../../types/auth';
import { timetableCreateInputSchema, timetableQuerySchema } from '../../validators/timetable';

export const timetableRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/',
    { preHandler: requireRole(['ADMIN']) },
    async (request, reply) => {
      const body = timetableCreateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }
      return timetableController.createEntry(request, reply, body.data);
    },
  );

  app.get(
    '/',
    { preHandler: requireRole(APP_ROLES) },
    async (request, reply) => {
      const query = timetableQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid query params',
          issues: query.error.issues,
        });
      }
      return timetableController.getMySchedule(request, reply, query.data);
    },
  );
};
