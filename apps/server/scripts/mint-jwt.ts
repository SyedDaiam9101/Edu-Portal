import { loadEnv } from '../src/config/env';
import { APP_ROLES, normalizeRole } from '../src/types/auth';
import { signJwtHS256 } from '../src/utils/jwt';

const env = loadEnv();
if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}

const roleArg = process.argv[2] ?? 'ADMIN';
const email = process.argv[3] ?? 'admin@example.com';
const days = Number(process.argv[4] ?? '7');

const role = normalizeRole(roleArg);
if (!role) {
  throw new Error(`Invalid role. Use one of: ${APP_ROLES.join(', ')}`);
}

const now = Math.floor(Date.now() / 1000);
const exp = now + Math.max(1, days) * 24 * 60 * 60;

const jwt = signJwtHS256({ role, email, exp }, env.JWT_SECRET);
// eslint-disable-next-line no-console
console.log(jwt);

