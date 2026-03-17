import Link from 'next/link';

export const dynamic = 'force-dynamic';

type HealthResponse = {
  ok: boolean;
  service: string;
  timestamp: string;
  db?: { enabled: boolean; ok?: boolean; message?: string };
};

async function getHealth(): Promise<HealthResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  try {
    const res = await fetch(`${baseUrl}/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const health = await getHealth();

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Edu Portal</h1>
      <p style={{ marginTop: 8 }}>
        API health:{' '}
        {health ? (
          <>
            <strong>OK</strong> ({health.service})
          </>
        ) : (
          <>
            <strong>Unavailable</strong> (start `@edu/server`)
          </>
        )}
      </p>
      {health?.db?.enabled ? (
        <p style={{ marginTop: 8 }}>
          DB: {health.db.ok ? <strong>OK</strong> : <strong>Down</strong>}
          {!health.db.ok && health.db.message ? ` (${health.db.message})` : null}
        </p>
      ) : null}

      <p style={{ marginTop: 16 }}>
        <Link href="/admin">Admin</Link> · <Link href="/teacher">Teacher</Link> ·{' '}
        <Link href="/student">Student</Link> ·
      </p>
    </main>
  );
}
