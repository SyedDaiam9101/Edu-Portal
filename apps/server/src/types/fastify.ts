import type { Env } from '../config/env';
import type { AuthUser } from './auth';

declare module 'fastify' {
  interface FastifyInstance {
    env: Env;
  }

  interface FastifyRequest {
    user: AuthUser | null;
  }
}

export {};
