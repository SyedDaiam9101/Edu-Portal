import type { FastifyPluginAsync } from 'fastify';

import { academicRoutes } from './academic.routes';
import { adminRoutes } from './admin.routes';
import { announcementRoutes } from './announcement.routes';
import { assignmentRoutes } from './assignment.routes';
import { authRoutes } from './auth.routes';
import { studentRoutes } from './student.routes';
import { teacherRoutes } from './teacher.routes';
import { timetableRoutes } from './timetable.routes';
import { submissionRoutes } from './submission.routes';

export const v1Routes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ ok: true, version: 'v1' }));

  await app.register(academicRoutes, { prefix: '/academic' });
  await app.register(announcementRoutes, { prefix: '/announcements' });
  await app.register(assignmentRoutes, { prefix: '/assignments' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(adminRoutes, { prefix: '/admin' });
  await app.register(studentRoutes, { prefix: '/students' });
  await app.register(teacherRoutes, { prefix: '/teacher' });
  await app.register(timetableRoutes, { prefix: '/timetable' });
  await app.register(submissionRoutes, { prefix: '/submissions' });
};
