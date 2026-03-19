import type { FastifyPluginAsync } from 'fastify';

import { adminController } from '../../controllers/admin.controller';
import { adminStatsController } from '../../controllers/adminStats.controller';
import { requireRole } from '../../middleware/auth.middleware';

export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/stats', { preHandler: requireRole(['ADMIN']) }, async (request, reply) =>
    adminStatsController.getStats(request, reply),
  );

  app.get('/revenue-analytics', { preHandler: requireRole(['ADMIN']) }, async (request, reply) => {
    const gradeLevel = String((request.query as { gradeLevel?: unknown })?.gradeLevel ?? '')
      .trim()
      .replace(/\s+/g, ' ');
    return adminController.getRevenueAnalytics(request, reply, gradeLevel.length > 0 ? gradeLevel : undefined);
  });
};
