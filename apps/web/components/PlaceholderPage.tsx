'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PlaceholderPage() {
  const pathname = usePathname();

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Edu Portal</h1>
      <p style={{ marginTop: 8 }}>
        Route: <code>{pathname}</code>
      </p>
      <p style={{ marginTop: 8 }}>
        This is a placeholder page generated from the project skeleton. Replace this with real UI
        as you implement features.
      </p>
      <p style={{ marginTop: 16 }}>
        <Link href="/admin">Admin</Link> · <Link href="/teacher">Teacher</Link>
      </p>
    </main>
  );
}

