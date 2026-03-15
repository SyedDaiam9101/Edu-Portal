import { describe, expect, it } from 'vitest';

import { buildApp } from '../../src/app';
import { loadEnv } from '../../src/config/env';

describe('GET /health', () => {
  it('returns ok', async () => {
    const env = loadEnv({ NODE_ENV: 'test' });
    const app = await buildApp({ env });

    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ ok: true, service: '@edu/server' });
  });
});

