'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogoutPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
        await fetch(`${baseUrl}/v1/auth/logout`, { method: 'POST', credentials: 'include' });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Logout failed');
        return;
      }

      router.replace('/admin/login');
      router.refresh();
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Signing out…</h1>
      {error ? <p style={{ marginTop: 12, color: '#b00020' }}>{error}</p> : null}
    </main>
  );
}

