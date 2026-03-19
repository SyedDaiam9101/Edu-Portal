import Link from 'next/link';
import { redirect } from 'next/navigation';

import WeeklyTimetable from '@/components/timetable/WeeklyTimetable';
import { adminAuthHeaders } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

type TimetableEntry = {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  startTime: string;
  endTime: string;
  gradeLevel: string;
  roomNumber: string;
  subject: { id: string; name: string };
  teacher: { id: string; name: string | null; email: string | null };
};

type TimetableResponse = { data: TimetableEntry[] };

type SearchParams = {
  gradeLevel?: string;
};

async function getSchedule(gradeLevel: string | undefined) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const qs = new URLSearchParams();
  if (gradeLevel) qs.set('gradeLevel', gradeLevel);
  const res = await fetch(`${baseUrl}/v1/timetable?${qs.toString()}`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) return { data: [] } as TimetableResponse;
  return (await res.json()) as TimetableResponse;
}

export default async function AdminTimetablePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const gradeLevel = (sp.gradeLevel ?? '').trim() || undefined;
  const schedule = await getSchedule(gradeLevel);

  return (
    <main style={{ padding: 24, maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>Master Timetable</h1>
          <p style={{ marginTop: 6, color: '#666' }}>View the weekly schedule by grade.</p>
        </div>
        <Link href="/admin" style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}>
          Back to dashboard
        </Link>
      </div>

      <form method="GET" style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
        <label>
          Grade Level
          <input
            name="gradeLevel"
            defaultValue={gradeLevel ?? ''}
            placeholder="e.g., 10"
            style={{ display: 'block', width: 160 }}
          />
        </label>
        <button type="submit" style={{ padding: '10px 12px' }}>
          Filter
        </button>
      </form>

      <WeeklyTimetable entries={schedule.data} />
    </main>
  );
}
