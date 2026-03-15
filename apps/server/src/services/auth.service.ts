import { prisma } from '../prisma/client';
import type { AuthLoginInput } from '../validators/auth';
import { normalizeRole } from '../types/auth';
import { httpError } from '../utils/httpError';
import { signJwtHS256 } from '../utils/jwt';
import { verifyPassword } from '../utils/password';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const authService = {
  async login(input: AuthLoginInput, options: { jwtSecret?: string }) {
    if (!options.jwtSecret) throw httpError(503, 'auth_not_configured', 'JWT_SECRET is not configured');

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, email: true, name: true, role: true, passwordHash: true },
    });

    const role = normalizeRole(user?.role);
    if (!user || !user.passwordHash || !role) {
      throw httpError(401, 'unauthorized', 'Invalid email or password');
    }

    const ok = await verifyPassword(user.passwordHash, input.password);
    if (!ok) throw httpError(401, 'unauthorized', 'Invalid email or password');

    const now = Math.floor(Date.now() / 1000);
    const exp = now + SESSION_TTL_SECONDS;

    const token = signJwtHS256(
      { sub: user.id, email: user.email, role, iat: now, exp },
      options.jwtSecret,
    );

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name, role },
      expiresInSeconds: SESSION_TTL_SECONDS,
    };
  },
};

