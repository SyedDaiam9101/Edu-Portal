import type { FastifyPluginAsync } from 'fastify';

import { announcementController } from '../../controllers/announcement.controller';
import { requireRole } from '../../middleware/auth.middleware';
import { APP_ROLES } from '../../types/auth';
import { announcementCreateInputSchema } from '../../validators/announcement';

export const announcementRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/broadcast',
    { preHandler: requireRole(['ADMIN']) },
    async (request, reply) => {
      const body = announcementCreateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }
      return announcementController.broadcast(request, reply, body.data);
    },
  );

  app.get(
    '/me',
    { preHandler: requireRole(APP_ROLES) },
    async (request, reply) => announcementController.getMyNotices(request, reply),
  );
};
