'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLE_REDIRECTS: Record<string, string> = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      const res = await fetch(`${baseUrl}/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setError(body?.message ?? `Login failed (${res.status})`);
        return;
      }

      const role = body?.data?.role as string | undefined;
      const destination = role ? ROLE_REDIRECTS[role] : undefined;
      if (!destination) {
        setError('Your account does not have an assigned portal role.');
        return;
      }

      router.replace(destination);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 520 }}>
      <h1 style={{ margin: 0 }}>Sign in</h1>
      <p style={{ marginTop: 8, color: '#666' }}>Access your Edu Portal account.</p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
            suppressHydrationWarning
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete="current-password"
            suppressHydrationWarning
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        {error ? (
          <p style={{ margin: 0, color: '#b00020', background: '#fff0f0', padding: 10 }}>
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} suppressHydrationWarning style={{ padding: '10px 12px', width: 'fit-content' }}>
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
