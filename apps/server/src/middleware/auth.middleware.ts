import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import type { AppRole } from '../types/auth';
import { normalizeRole } from '../types/auth';
import { httpError } from '../utils/httpError';
import { verifyJwtHS256 } from '../utils/jwt';
import { SESSION_COOKIE_NAME } from '../controllers/auth.controller';

function getBearerToken(request: FastifyRequest) {
  const authorization = request.headers.authorization;
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)\s*$/i.exec(authorization);
  if (!match) return null;
  return match[1]?.trim() || null;
}

const jwtPayloadSchema = z
  .object({
    sub: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.unknown(),
    exp: z.number().optional(),
  })
  .passthrough();

const mockUserSchema = z
  .object({
    id: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.unknown(),
  })
  .passthrough();

function parseAuthUser(request: FastifyRequest) {
  const env = request.server.env;
  const token = getBearerToken(request) ?? request.cookies?.[SESSION_COOKIE_NAME];

  if (token) {
    if (!env.JWT_SECRET) throw httpError(503, 'auth_not_configured', 'JWT_SECRET is not configured');
    let payload: z.infer<typeof jwtPayloadSchema>;
    try {
      payload = jwtPayloadSchema.parse(verifyJwtHS256(token, env.JWT_SECRET));
    } catch {
      throw httpError(401, 'unauthorized', 'Invalid token');
    }
    const role = normalizeRole(payload.role);
    if (!role) throw httpError(401, 'unauthorized', 'Invalid token role');

    return {
      id: payload.sub ?? null,
      email: payload.email ?? null,
      role,
    };
  }

  const mockHeader = request.headers['x-mock-user'];
  if (typeof mockHeader === 'string' && mockHeader.trim().length > 0) {
    if (env.NODE_ENV === 'production') throw httpError(401, 'unauthorized', 'Mock auth is disabled');
    let parsed: unknown;
    try {
      parsed = JSON.parse(mockHeader);
    } catch {
      throw httpError(401, 'unauthorized', 'Invalid mock header');
    }

    let mock: z.infer<typeof mockUserSchema>;
    try {
      mock = mockUserSchema.parse(parsed);
    } catch {
      throw httpError(401, 'unauthorized', 'Invalid mock header');
    }
    const role = normalizeRole(mock.role);
    if (!role) throw httpError(401, 'unauthorized', 'Invalid mock role');

    return {
      id: mock.id ?? null,
      email: mock.email ?? null,
      role,
    };
  }

  return null;
}

export async function attachUser(request: FastifyRequest, _reply: FastifyReply) {
  if (request.user) return;
  const hasBearer = Boolean(getBearerToken(request));
  const hasMock = typeof request.headers['x-mock-user'] === 'string';
  const hasCookie = typeof request.cookies?.[SESSION_COOKIE_NAME] === 'string';
  if (!hasBearer && !hasMock && !hasCookie) return;
  request.user = parseAuthUser(request);
}

export function requireRole(roles: readonly AppRole[]) {
  return async function roleGuard(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) await attachUser(request, reply);
    if (!request.user) throw httpError(401, 'unauthorized', 'Missing authentication');

    if (!roles.includes(request.user.role)) {
      throw httpError(403, 'forbidden', 'Insufficient role');
    }
  };
}
