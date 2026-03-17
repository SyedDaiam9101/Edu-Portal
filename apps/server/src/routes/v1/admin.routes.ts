import type { FastifyPluginAsync } from 'fastify';

import { adminStatsController } from '../../controllers/adminStats.controller';
import { requireRole } from '../../middleware/auth.middleware';

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/stats', { preHandler: requireRole(['ADMIN']) }, async (request, reply) =>
    adminStatsController.getStats(request, reply),
  );
};
