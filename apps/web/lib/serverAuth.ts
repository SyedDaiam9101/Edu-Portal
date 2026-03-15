import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'edu_session';

export async function adminAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value?.trim();
  if (session) return { authorization: `Bearer ${session}` };

  if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_MOCK_AUTH === 'true') {
    return {
      'x-mock-user': JSON.stringify({ email: 'admin@example.com', role: 'ADMIN' }),
    };
  }

  return {};
}
