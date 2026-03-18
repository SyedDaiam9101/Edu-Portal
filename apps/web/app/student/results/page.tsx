import Link from 'next/link';
import { redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';

import type { ExamResult, StudentDashboardResponse } from '../types';

export const dynamic = 'force-dynamic';

async function getDashboard(): Promise<StudentDashboardResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/students/me/dashboard`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/login');
  }
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return (await res.json()) as StudentDashboardResponse;
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatScore(score: string, maxScore: string) {
  return `${score} / ${maxScore}`;
}

function groupBySubject(results: ExamResult[]) {
  const grouped = new Map<string, ExamResult[]>();
  for (const result of results) {
    const key = result.exam.subject.name;
    const list = grouped.get(key) ?? [];
    list.push(result);
    grouped.set(key, list);
  }
  return grouped;
}

function standingMessage(gpa: number) {
  if (gpa >= 3.5) return 'Excellent Standing';
  if (gpa >= 3.0) return 'Strong Standing';
  if (gpa >= 2.0) return 'Good Standing';
  return 'At-Risk Standing';
}

export default async function StudentReportCardPage() {
  const payload = await getDashboard();
  if (!payload) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ margin: 0 }}>Report Card</h1>
        <p style={{ marginTop: 8 }}>We couldn&apos;t find a student record for your account.</p>
      </main>
    );
  }

  const { student, gpa, results } = payload.data;
  const grouped = groupBySubject(results);

  return (
    <main style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>Report Card</h1>
          <p style={{ marginTop: 6, color: '#666' }}>
            {student.firstName} {student.lastName} · Roll # <code>{student.rollNumber}</code>
          </p>
        </div>
        <Link href="/student" style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}>
          Back to dashboard
        </Link>
      </div>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: '1px solid #e5e5e5',
          borderRadius: 16,
          background: '#f7f7fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: '#5b5b5b' }}>GPA</div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{gpa.gpa.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {gpa.examsTaken} exam{gpa.examsTaken === 1 ? '' : 's'} recorded
          </div>
        </div>
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 999,
            background: '#111',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {standingMessage(gpa.gpa)}
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>Academic Record</h2>
        {results.length === 0 ? (
          <p>No exam results yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Subject</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Exam</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Score</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(grouped.entries()).map(([subject, subjectResults]) =>
                subjectResults.map((result, index) => (
                  <tr key={result.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {index === 0 ? subject : ''}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {result.exam.name}
                      {result.exam.term ? ` (${result.exam.term})` : ''}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {formatScore(result.score, result.exam.maxScore)}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{formatDate(result.exam.date)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
