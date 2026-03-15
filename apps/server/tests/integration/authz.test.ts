import Fastify from 'fastify';
import { describe, expect, it } from 'vitest';

import { requireRole } from '../../src/middleware/auth.middleware';
import { loadEnv } from '../../src/config/env';
import { signJwtHS256 } from '../../src/utils/jwt';

describe('authz (jwt + role guard)', () => {
  it('enforces role guards for read/write routes', async () => {
    const env = loadEnv({
      NODE_ENV: 'test',
      JWT_SECRET: 'super-secret-jwt-signing-key',
    });

    const app = Fastify({ logger: false });
    app.decorate('env', env);
    app.decorateRequest('user', null);

    app.get('/students', { preHandler: requireRole(['ADMIN', 'TEACHER', 'STUDENT']) }, async () => ({
      ok: true,
    }));
    app.post('/students', { preHandler: requireRole(['ADMIN', 'TEACHER']) }, async () => ({ ok: true }));

    const now = Math.floor(Date.now() / 1000);
    const adminJwt = signJwtHS256({ role: 'ADMIN', email: 'admin@example.com', exp: now + 60 }, env.JWT_SECRET!);
    const studentJwt = signJwtHS256(
      { role: 'STUDENT', email: 'student@example.com', exp: now + 60 },
      env.JWT_SECRET!,
    );

    const missing = await app.inject({ method: 'GET', url: '/students' });
    expect(missing.statusCode).toBe(401);

    const studentRead = await app.inject({
      method: 'GET',
      url: '/students',
      headers: { authorization: `Bearer ${studentJwt}` },
    });
    expect(studentRead.statusCode).toBe(200);

    const studentWrite = await app.inject({
      method: 'POST',
      url: '/students',
      headers: { authorization: `Bearer ${studentJwt}` },
    });
    expect(studentWrite.statusCode).toBe(403);

    const adminWrite = await app.inject({
      method: 'GET',
      url: '/students',
      headers: { authorization: `Bearer ${adminJwt}` },
    });
    expect(adminWrite.statusCode).toBe(200);

    const mock = await app.inject({
      method: 'POST',
      url: '/students',
      headers: { 'x-mock-user': JSON.stringify({ email: 'admin@example.com', role: 'ADMIN' }) },
    });
    expect(mock.statusCode).toBe(200);
  });
});
