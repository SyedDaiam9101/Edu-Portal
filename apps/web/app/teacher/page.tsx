import Link from 'next/link';
import { redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';
import DashboardAnnouncement from '@/components/dashboard/DashboardAnnouncement';
import TeacherSubmissionInbox from '@/components/dashboard/TeacherSubmissionInbox';

import TeacherDashboardClient from './TeacherDashboardClient';
import type {
  TeacherClassListResponse,
  TeacherStudent,
  TeacherSubmissionsResponse,
} from './types';

export const dynamic = 'force-dynamic';

type AttendanceRecord = { status: 'PRESENT' | 'ABSENT' | 'LATE' };
type AttendanceListResponse = { data: AttendanceRecord[] };
type ResultsResponse = { data: { gpa: { gpa: number; examsTaken: number } } };

function startOfToday() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

function endOfToday() {
  const end = new Date(startOfToday());
  end.setHours(23, 59, 59, 999);
  return end;
}

async function getMyStudents(headers: Record<string, string>): Promise<TeacherStudent[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/v1/teacher/class-list`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/login');
  }
  if (!res.ok) return [];
  const json = (await res.json()) as TeacherClassListResponse;
  return json.data ?? [];
}

async function getAttendanceStats(students: TeacherStudent[], headers: Record<string, string>) {
  if (students.length === 0) {
    return { attendanceRateToday: 0, presentToday: 0 };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const qs = new URLSearchParams({
    from: startOfToday().toISOString(),
    to: endOfToday().toISOString(),
    take: '10',
  });

  const responses = await Promise.all(
    students.map((student) =>
      fetch(`${baseUrl}/v1/students/${student.id}/attendance?${qs.toString()}`, {
        cache: 'no-store',
        headers,
      }),
    ),
  );

  if (responses.some((res) => res.status === 401 || res.status === 403)) {
    redirect('/login');
  }

  const payloads = await Promise.all(
    responses.map(async (res) => {
      if (!res.ok) return { data: [] } as AttendanceListResponse;
      return (await res.json()) as AttendanceListResponse;
    }),
  );

  const presentToday = payloads.filter((payload) =>
    payload.data.some((record) => record.status === 'PRESENT'),
  ).length;
  const attendanceRateToday = Math.round((presentToday / students.length) * 1000) / 10;
  return { attendanceRateToday, presentToday };
}

async function getClassGpaAverage(students: TeacherStudent[], headers: Record<string, string>) {
  if (students.length === 0) return 0;

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const responses = await Promise.all(
    students.map((student) =>
      fetch(`${baseUrl}/v1/academic/students/${student.id}/results`, {
        cache: 'no-store',
        headers,
      }),
    ),
  );

  if (responses.some((res) => res.status === 401 || res.status === 403)) {
    redirect('/login');
  }

  const payloads = await Promise.all(
    responses.map(async (res) => {
      if (!res.ok) return { data: { gpa: { gpa: 0, examsTaken: 0 } } } as ResultsResponse;
      return (await res.json()) as ResultsResponse;
    }),
  );

  const withResults = payloads
    .map((payload) => payload.data.gpa)
    .filter((gpa) => gpa.examsTaken > 0);

  if (withResults.length === 0) return 0;
  const total = withResults.reduce((sum, item) => sum + item.gpa, 0);
  return Math.round((total / withResults.length) * 100) / 100;
}

async function getRecentSubmissions(headers: Record<string, string>) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/v1/submissions/teacher`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/login');
  }
  if (!res.ok) return { data: [] } as TeacherSubmissionsResponse;
  return (await res.json()) as TeacherSubmissionsResponse;
}

export default async function TeacherDashboardPage() {
  const headers = await adminAuthHeaders();
  const students = await getMyStudents(headers);
  const [{ attendanceRateToday }, classGpaAverage, submissions] = await Promise.all([
    getAttendanceStats(students, headers),
    getClassGpaAverage(students, headers),
    getRecentSubmissions(headers),
  ]);

  return (
    <main style={{ padding: 24, maxWidth: 1100, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'baseline' }}>
        <h1 style={{ margin: 0 }}>Teacher Hub</h1>
        <span style={{ fontSize: 12, color: '#666' }}>Grade-focused command center</span>
        <Link href="/teacher/timetable" style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}>
          View Full Schedule
        </Link>
      </div>

      <DashboardAnnouncement />

      <TeacherSubmissionInbox submissions={submissions.data} />

      <TeacherDashboardClient
        students={students}
        stats={{
          totalStudents: students.length,
          attendanceRateToday,
          classGpaAverage,
        }}
      />
    </main>
  );
}
