import type { StudentGetResponse } from '@edu/types';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';

import ResultsClient from './ResultsClient';
import type { ExamListResponse, StudentResultsResponse } from './types';

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

async function getResults(id: string): Promise<StudentResultsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/academic/students/${id}/results`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) return { data: { results: [], gpa: { gpa: 0, examsTaken: 0 } } };
  return (await res.json()) as StudentResultsResponse;
}

async function getExams(gradeLevel: string | null): Promise<ExamListResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const qs = new URLSearchParams();
  if (gradeLevel) qs.set('gradeLevel', gradeLevel);
  qs.set('take', '200');
  const res = await fetch(`${baseUrl}/v1/academic/exams?${qs.toString()}`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) return { data: [] };
  return (await res.json()) as ExamListResponse;
}

export default async function StudentResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const s = student.data;
  const [results, exams] = await Promise.all([getResults(id), getExams(s.gradeLevel ?? null)]);

  return (
    <main style={{ padding: 24, maxWidth: 960 }}>
      <h1 style={{ margin: 0 }}>Results</h1>
      <p style={{ marginTop: 8 }}>
        <Link href={`/admin/students/${s.id}`}>Back to student</Link>
      </p>
      <p style={{ marginTop: 8 }}>
        {s.firstName} {s.lastName} - Roll # <code>{s.rollNumber}</code>
      </p>

      <ResultsClient
        studentId={s.id}
        studentName={`${s.firstName} ${s.lastName}`}
        gradeLevel={s.gradeLevel ?? null}
        initialResults={results.data.results}
        initialGpa={results.data.gpa}
        exams={exams.data}
      />
    </main>
  );
}
