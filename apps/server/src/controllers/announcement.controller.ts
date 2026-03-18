import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../prisma/client';
import type { AnnouncementCreateInput } from '../validators/announcement';

export const announcementController = {
  async broadcast(_request: FastifyRequest, reply: FastifyReply, input: AnnouncementCreateInput) {
    const created = await prisma.announcement.create({
      data: {
        title: input.title,
        content: input.content,
        audience: input.audience,
      },
      select: {
        id: true,
        title: true,
        content: true,
        audience: true,
        createdAt: true,
      },
    });

    return reply.status(201).send({ data: created });
  },

  async getMyNotices(request: FastifyRequest, reply: FastifyReply) {
    const role = request.user?.role;
    if (!role) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing authentication' });
    }

    const audiences =
      role === 'TEACHER'
        ? ['GLOBAL', 'TEACHERS']
        : role === 'STUDENT'
          ? ['GLOBAL', 'STUDENTS']
          : ['GLOBAL'];

    const notices = await prisma.announcement.findMany({
      where: { audience: { in: audiences } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        content: true,
        audience: true,
        createdAt: true,
      },
    });

    return reply.send({ data: notices });
  },
};
