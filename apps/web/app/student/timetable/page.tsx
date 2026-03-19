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

async function getSchedule() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/timetable`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/login');
  }
  if (!res.ok) return { data: [] } as TimetableResponse;
  return (await res.json()) as TimetableResponse;
}

export default async function StudentTimetablePage() {
  const schedule = await getSchedule();

  return (
    <main style={{ padding: 24, maxWidth: 1200, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>My Weekly Schedule</h1>
          <p style={{ marginTop: 6, color: '#666' }}>Your class timetable for the week.</p>
        </div>
        <Link href="/student" style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}>
          Back to dashboard
        </Link>
      </div>

      <WeeklyTimetable entries={schedule.data} />
    </main>
  );
}
