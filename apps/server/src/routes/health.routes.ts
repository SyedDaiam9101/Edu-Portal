import type { FastifyPluginAsync } from 'fastify';

import type { Env } from '../config/env';

export const healthRoutes: FastifyPluginAsync<{ env: Env }> = async (app, opts) => {
  app.get('/health', async () => {
    const db = await checkDatabase(opts.env.DATABASE_URL);
    return {
      ok: true,
      service: '@edu/server',
      timestamp: new Date().toISOString(),
      db,
    };
  });
};

async function checkDatabase(databaseUrl?: string) {
  if (!databaseUrl) return { enabled: false as const };

  try {
    // Avoid loading Prisma unless DATABASE_URL is configured.
    // Use `require` to keep NodeNext TS happy without explicit extensions.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { prisma } = require('../prisma/client') as typeof import('../prisma/client');
    await withTimeout(prisma.$queryRaw`SELECT 1`, 400);
    return { enabled: true as const, ok: true as const };
  } catch (error) {
    return {
      enabled: true as const,
      ok: false as const,
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
