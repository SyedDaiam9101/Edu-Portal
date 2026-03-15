import type { FastifyReply, FastifyRequest } from 'fastify';

import { authService } from '../services/auth.service';
import type { AuthLoginInput } from '../validators/auth';

export const SESSION_COOKIE_NAME = 'edu_session';

export const authController = {
  async login(request: FastifyRequest, reply: FastifyReply, input: AuthLoginInput) {
    const { token, user, expiresInSeconds } = await authService.login(input, {
      ...(request.server.env.JWT_SECRET ? { jwtSecret: request.server.env.JWT_SECRET } : {}),
    });

    reply.setCookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: request.server.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresInSeconds,
    });

    return reply.send({ data: user });
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.status(401).send({ error: 'unauthorized', message: 'Missing authentication' });
    }
    return reply.send({ data: request.user });
  },

  async logout(_request: FastifyRequest, reply: FastifyReply) {
    reply.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
    return reply.send({ ok: true });
  },
};
