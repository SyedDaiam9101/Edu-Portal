'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
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

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? `Login failed (${res.status})`);
        return;
      }

      router.replace('/admin/students');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 520 }}>
      <h1 style={{ margin: 0 }}>Admin Login</h1>
      <p style={{ marginTop: 8, color: '#666' }}>Sign in to manage the portal.</p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <label>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
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
            style={{ display: 'block', width: '100%' }}
          />
        </label>

        {error ? (
          <p style={{ margin: 0, color: '#b00020', background: '#fff0f0', padding: 10 }}>
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} style={{ padding: '10px 12px', width: 'fit-content' }}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}

