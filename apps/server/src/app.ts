import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import type { Env } from './config/env';
import { attachUser } from './middleware/auth.middleware';
import { healthRoutes } from './routes/health.routes';
import { v1Routes } from './routes/v1';
import { isHttpError } from './utils/httpError';

export async function buildApp({ env }: { env: Env }) {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'production'
        ? true
        : {
            level: env.LOG_LEVEL,
            transport: {
              target: 'pino-pretty',
              options: { translateTime: 'SYS:standard', ignore: 'pid,hostname' },
            },
          },
    disableRequestLogging: env.NODE_ENV === 'test',
  });

  app.decorate('env', env);
  app.decorateRequest('user', null);

  await app.register(helmet);
  await app.register(cookie);
  await app.register(cors, {
    origin: parseCorsOrigins(env.CORS_ORIGIN),
    credentials: true,
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  app.addHook('preHandler', attachUser);

  app.setNotFoundHandler(async (request, reply) => {
    reply.status(404).send({
      error: 'not_found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  app.setErrorHandler(async (error, _request, reply) => {
    app.log.error({ error }, 'request: error');
    if (isHttpError(error)) {
      reply.status(error.statusCode).send({ error: error.code, message: error.message });
      return;
    }

    reply.status(500).send({
      error: 'internal_server_error',
      message: env.NODE_ENV === 'production' ? 'Unexpected error' : error.message,
    });
  });

  await app.register(healthRoutes, { env });
  await app.register(v1Routes, { prefix: '/v1' });

  return app;
}

function parseCorsOrigins(value: string) {
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) return false;
  if (origins.includes('*')) return true;

  return origins;
}
