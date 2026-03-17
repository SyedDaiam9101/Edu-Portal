import type { StudentGetResponse } from '@edu/types';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';

import AttendanceClient from './AttendanceClient';
import type { AttendanceListResponse } from './types';

export const dynamic = 'force-dynamic';

async function getStudent(id: string): Promise<StudentGetResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/students/${id}`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) return null;
  return (await res.json()) as StudentGetResponse;
}

async function getAttendance(id: string): Promise<AttendanceListResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const qs = new URLSearchParams({ take: '60' });
  const res = await fetch(`${baseUrl}/v1/students/${id}/attendance?${qs.toString()}`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) return { data: [] };
  return (await res.json()) as AttendanceListResponse;
}

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [student, attendance] = await Promise.all([getStudent(id), getAttendance(id)]);
  if (!student) notFound();

  const s = student.data;

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>Attendance</h1>
      <p style={{ marginTop: 8 }}>
        <Link href={`/admin/students/${s.id}`}>Back to student</Link>
      </p>
      <p style={{ marginTop: 8 }}>
        {s.firstName} {s.lastName} - Roll # <code>{s.rollNumber}</code>
      </p>

      <AttendanceClient
        studentId={s.id}
        studentName={`${s.firstName} ${s.lastName}`}
        initialRecords={attendance.data}
      />
    </main>
  );
}
