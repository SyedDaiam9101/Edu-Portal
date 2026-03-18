import type { FastifyPluginAsync } from 'fastify';

import { academicRoutes } from './academic.routes';
import { adminRoutes } from './admin.routes';
import { authRoutes } from './auth.routes';
import { studentRoutes } from './student.routes';

export const v1Routes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ ok: true, version: 'v1' }));

  await app.register(academicRoutes, { prefix: '/academic' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(adminRoutes, { prefix: '/admin' });
  await app.register(studentRoutes, { prefix: '/students' });
};
