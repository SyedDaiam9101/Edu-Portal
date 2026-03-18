import Link from 'next/link';
import { redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';

import AttendanceBulkClient from './AttendanceBulkClient';
import type {
  TeacherClassAttendanceTodayResponse,
  TeacherClassListResponse,
  TeacherStudent,
} from '../types';

export const dynamic = 'force-dynamic';

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

async function getTodayAttendanceStatuses(headers: Record<string, string>) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/v1/teacher/class-attendance-today`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/login');
  }
  if (!res.ok) return { statuses: {}, hasExisting: false };
  const json = (await res.json()) as TeacherClassAttendanceTodayResponse;
  const statuses = json.data?.statuses ?? {};
  const hasExisting = (json.data?.count ?? 0) > 0;
  return { statuses, hasExisting };
}

export default async function TeacherAttendancePage() {
  const headers = await adminAuthHeaders();
  const students = await getMyStudents(headers);
  const { statuses, hasExisting } = await getTodayAttendanceStatuses(headers);

  return (
    <main style={{ padding: 24, maxWidth: 1100, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>Bulk Attendance</h1>
          <p style={{ marginTop: 6, color: '#666' }}>Mark today&apos;s attendance for your class in one pass.</p>
        </div>
        <Link
          href="/teacher"
          style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}
        >
          Back to dashboard
        </Link>
      </div>

      <AttendanceBulkClient
        students={students}
        initialStatuses={statuses}
        hasExistingAttendance={hasExisting}
      />
    </main>
  );
}
