import type { StudentListResponse } from '@edu/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

type StudentsSearchParams = {
  q?: string;
  cursor?: string;
  take?: string;
  includeArchived?: string;
};

function parseBoolean(value: string | undefined) {
  if (!value) return false;
  return value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'on';
}

async function listStudents(params: {
  take: number;
  cursor?: string;
  q?: string;
  includeArchived: boolean;
}): Promise<StudentListResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();

  const qs = new URLSearchParams();
  qs.set('take', String(params.take));
  if (params.cursor) qs.set('cursor', params.cursor);
  if (params.q) qs.set('q', params.q);
  if (params.includeArchived) qs.set('includeArchived', 'true');

  const res = await fetch(`${baseUrl}/v1/students?${qs.toString()}`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) {
    return { data: [], nextCursor: null };
  }
  return (await res.json()) as StudentListResponse;
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<StudentsSearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim() || undefined;
  const cursor = (sp.cursor ?? '').trim() || undefined;
  const take = Number.isFinite(Number(sp.take)) ? Math.max(1, Math.min(100, Number(sp.take))) : 25;
  const includeArchived = parseBoolean(sp.includeArchived);

  const { data, nextCursor } = await listStudents({
    take,
    includeArchived,
    ...(q ? { q } : {}),
    ...(cursor ? { cursor } : {}),
  });

  const buildHref = (next: Partial<StudentsSearchParams>) => {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (includeArchived) qs.set('includeArchived', 'true');
    if (take !== 25) qs.set('take', String(take));
    if (next.cursor) qs.set('cursor', next.cursor);
    return `/admin/students${qs.size ? `?${qs.toString()}` : ''}`;
  };

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Students</h1>
      <p style={{ marginTop: 8 }}>
        <Link href="/admin/students/add">Add student</Link>
        {' · '}
        <Link href="/admin/logout">Logout</Link>
      </p>

      <form method="GET" style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'end' }}>
        <label style={{ flex: 1 }}>
          Search
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder="Roll #, name, email…"
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label>
          Show archived
          <input
            name="includeArchived"
            type="checkbox"
            defaultChecked={includeArchived}
            style={{ display: 'block' }}
          />
        </label>
        <button type="submit" style={{ padding: '10px 12px' }}>
          Apply
        </button>
      </form>

      {data.length === 0 ? (
        <p style={{ marginTop: 16 }}>No students yet.</p>
      ) : (
        <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>
                Roll #
              </th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>
                Name
              </th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>
                Grade
              </th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((s: StudentListResponse['data'][number]) => (
              <tr key={s.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <Link href={`/admin/students/${s.id}`}>{s.rollNumber}</Link>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {s.firstName} {s.lastName}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  {s.gradeLevel ?? '-'} {s.section ? `(${s.section})` : ''}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{s.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        {cursor ? <Link href={buildHref({})}>First page</Link> : null}
        {nextCursor ? <Link href={buildHref({ cursor: nextCursor })}>Next</Link> : null}
      </div>
    </main>
  );
}
