import type { FastifyPluginAsync } from 'fastify';

import { authController } from '../../controllers/auth.controller';
import { requireRole } from '../../middleware/auth.middleware';
import { authLoginInputSchema } from '../../validators/auth';
import { APP_ROLES } from '../../types/auth';

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/login', async (request, reply) => {
    const body = authLoginInputSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Invalid request body',
        issues: body.error.issues,
      });
    }
    return authController.login(request, reply, body.data);
  });

  app.post('/logout', async (request, reply) => authController.logout(request, reply));

  app.get('/me', { preHandler: requireRole(APP_ROLES) }, async (request, reply) =>
    authController.me(request, reply),
  );
};
