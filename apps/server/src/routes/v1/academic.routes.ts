import type { FastifyPluginAsync } from 'fastify';

import { academicController } from '../../controllers/academic.controller';
import { requireRole } from '../../middleware/auth.middleware';
import {
  examCreateInputSchema,
  examListQuerySchema,
  examResultInputSchema,
  subjectCreateInputSchema,
} from '../../validators/academic';
import { studentIdSchema } from '../../validators/student';

export const academicRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/subjects',
    { preHandler: requireRole(['ADMIN', 'TEACHER']) },
    async (request, reply) => {
      const body = subjectCreateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }
      return academicController.createSubject(request, reply, body.data);
    },
  );

  app.post(
    '/exams',
    { preHandler: requireRole(['ADMIN', 'TEACHER']) },
    async (request, reply) => {
      const body = examCreateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }
      return academicController.createExam(request, reply, body.data);
    },
  );

  app.get(
    '/exams',
    { preHandler: requireRole(['ADMIN', 'TEACHER']) },
    async (request, reply) => {
      const query = examListQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid query params',
          issues: query.error.issues,
        });
      }

      return academicController.listExams(request, reply, query.data);
    },
  );

  app.post(
    '/students/:id/results',
    { preHandler: requireRole(['ADMIN', 'TEACHER']) },
    async (request, reply) => {
      const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
      if (!id.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid student id',
          issues: id.error.issues,
        });
      }

      const body = examResultInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }

      return academicController.createExamResult(request, reply, id.data, body.data);
    },
  );

  app.get(
    '/students/:id/results',
    { preHandler: requireRole(['ADMIN', 'TEACHER']) },
    async (request, reply) => {
      const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
      if (!id.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid student id',
          issues: id.error.issues,
        });
      }

      return academicController.listResultsByStudent(request, reply, id.data);
    },
  );
};
