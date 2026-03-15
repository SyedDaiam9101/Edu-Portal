import type { FastifyPluginAsync } from 'fastify';

import { authRoutes } from './auth.routes';
import { studentRoutes } from './student.routes';

export const v1Routes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ ok: true, version: 'v1' }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(studentRoutes, { prefix: '/students' });
};
