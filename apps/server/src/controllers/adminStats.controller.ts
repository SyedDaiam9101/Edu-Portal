import type { FastifyReply, FastifyRequest } from 'fastify';

import { adminStatsService } from '../services/adminStats.service';

export const adminStatsController = {
  async getStats(_request: FastifyRequest, reply: FastifyReply) {
    const stats = await adminStatsService.getStats();
    return reply.send({ data: stats });
  },
};
