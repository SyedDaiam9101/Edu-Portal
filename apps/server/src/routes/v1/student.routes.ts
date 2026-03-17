import type { FastifyPluginAsync } from 'fastify';

import { attendanceController } from '../../controllers/attendance.controller';
import { feeController } from '../../controllers/fee.controller';
import { studentController } from '../../controllers/student.controller';
import { requireRole } from '../../middleware/auth.middleware';
import {
  attendanceCreateInputSchema,
  attendanceListQuerySchema,
} from '../../validators/attendance';
import { feeCreateInputSchema, feeListQuerySchema } from '../../validators/fee';
import {
  studentCreateInputSchema,
  studentIdSchema,
  studentListQuerySchema,
  studentUpdateInputSchema,
} from '../../validators/student';

export const studentRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/',
    { preHandler: requireRole(['ADMIN', 'TEACHER', 'STUDENT']) },
    async (request, reply) => {
      const query = studentListQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid query params',
          issues: query.error.issues,
        });
      }
      return studentController.list(request, reply, query.data);
    },
  );

  app.post('/', { preHandler: requireRole(['ADMIN', 'TEACHER']) }, async (request, reply) => {
    const body = studentCreateInputSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({
        error: 'validation_error',
        message: 'Invalid request body',
        issues: body.error.issues,
      });
    }
    return studentController.create(request, reply, body.data);
  });

  app.get(
    '/:id',
    { preHandler: requireRole(['ADMIN', 'TEACHER', 'STUDENT']) },
    async (request, reply) => {
      const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
      if (!id.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid student id',
          issues: id.error.issues,
        });
      }
      return studentController.getById(request, reply, id.data);
    },
  );

  app.get(
    '/:id/attendance',
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

      const query = attendanceListQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid query params',
          issues: query.error.issues,
        });
      }

      return attendanceController.listByStudent(request, reply, id.data, query.data);
    },
  );

  app.post(
    '/:id/attendance',
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

      const body = attendanceCreateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }

      return attendanceController.createForStudent(request, reply, id.data, body.data);
    },
  );

  app.get(
    '/:id/fees',
    { preHandler: requireRole(['ADMIN']) },
    async (request, reply) => {
      const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
      if (!id.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid student id',
          issues: id.error.issues,
        });
      }

      const query = feeListQuerySchema.safeParse(request.query);
      if (!query.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid query params',
          issues: query.error.issues,
        });
      }

      return feeController.listByStudent(request, reply, id.data, query.data);
    },
  );

  app.post(
    '/:id/fees',
    { preHandler: requireRole(['ADMIN']) },
    async (request, reply) => {
      const id = studentIdSchema.safeParse((request.params as { id?: unknown })?.id);
      if (!id.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid student id',
          issues: id.error.issues,
        });
      }

      const body = feeCreateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }

      return feeController.createForStudent(request, reply, id.data, body.data);
    },
  );

  app.post(
    '/:id/fees/:feeId/pay',
    { preHandler: requireRole(['ADMIN']) },
    async (request, reply) => {
      const params = request.params as { id?: unknown; feeId?: unknown };
      const id = studentIdSchema.safeParse(params?.id);
      const feeId = studentIdSchema.safeParse(params?.feeId);
      if (!id.success || !feeId.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid id',
          issues: [id, feeId].flatMap((value) => (value.success ? [] : value.error.issues)),
        });
      }

      return feeController.markPaid(request, reply, id.data, feeId.data);
    },
  );

  app.patch(
    '/:id',
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

      const body = studentUpdateInputSchema.safeParse(request.body);
      if (!body.success) {
        return reply.status(400).send({
          error: 'validation_error',
          message: 'Invalid request body',
          issues: body.error.issues,
        });
      }

      return studentController.update(request, reply, id.data, body.data);
    },
  );

  app.delete(
    '/:id',
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
      return studentController.remove(request, reply, id.data);
    },
  );
};
