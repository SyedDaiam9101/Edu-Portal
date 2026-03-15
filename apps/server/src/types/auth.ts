export const APP_ROLES = ['ADMIN', 'TEACHER', 'STUDENT'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export type AuthUser = {
  id: string | null;
  email: string | null;
  role: AppRole;
};

export function normalizeRole(role: unknown): AppRole | null {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'TEACHER') return 'TEACHER';
  if (role === 'STUDENT') return 'STUDENT';
  // Back-compat: Prisma enum historically used USER as the default.
  if (role === 'USER') return 'STUDENT';
  return null;
}

