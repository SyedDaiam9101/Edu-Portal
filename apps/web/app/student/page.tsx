import Link from 'next/link';
import { redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';
import DashboardAnnouncement from '@/components/dashboard/DashboardAnnouncement';
import PendingAssignments from '@/components/dashboard/PendingAssignments';

import type {
  ExamResult,
  StudentAssignmentsResponse,
  StudentDashboardResponse,
} from './types';

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

async function getAssignments(): Promise<StudentAssignmentsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/assignments/my`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/login');
  }
  if (!res.ok) return { data: [] };
  return (await res.json()) as StudentAssignmentsResponse;
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatScore(score: string, maxScore: string) {
  return `${score} / ${maxScore}`;
}

function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function sumOutstandingFees(results: StudentDashboardResponse['data']['unpaidFees']) {
  return results.reduce((sum, fee) => sum + (Number(fee.amount) || 0), 0);
}

function sortByExamDate(results: ExamResult[]) {
  return [...results].sort((a, b) => new Date(b.exam.date).getTime() - new Date(a.exam.date).getTime());
}

export default async function StudentDashboardPage() {
  const [payload, assignments] = await Promise.all([getDashboard(), getAssignments()]);
  if (!payload) {
    return (
      <main style={{ padding: 24 }}>
        <h1 style={{ margin: 0 }}>Student Dashboard</h1>
        <p style={{ marginTop: 8 }}>We couldn&apos;t find a student record for your account.</p>
      </main>
    );
  }

  const { student, gpa, results, unpaidFees } = payload.data;
  const outstanding = sumOutstandingFees(unpaidFees);
  const recentResults = sortByExamDate(results).slice(0, 5);

  return (
    <main style={{ padding: 24, maxWidth: 1000 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
            Welcome back, {student.firstName}
          </h1>
          <p style={{ marginTop: 6, color: '#666' }}>
            Grade {student.gradeLevel ?? '-'} {student.section ? `· Section ${student.section}` : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/student/results" style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}>
            View Report Card
          </Link>
          <Link href="/student/timetable" style={{ textDecoration: 'none', color: '#111', fontWeight: 600 }}>
            View Full Schedule
          </Link>
        </div>
      </div>

      <DashboardAnnouncement />

      <PendingAssignments assignments={assignments.data} />

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginTop: 20,
        }}
      >
        <div
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 16,
            padding: 16,
            background: '#f7f7fb',
          }}
        >
          <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            GPA
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, marginTop: 8 }}>{gpa.gpa.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#777', marginTop: 6 }}>
            {gpa.examsTaken} exam{gpa.examsTaken === 1 ? '' : 's'} recorded
          </div>
          <Link
            href="/student/results"
            style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#111', fontWeight: 600 }}
          >
            Report Card
          </Link>
        </div>

        <div
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 16,
            padding: 16,
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Outstanding Fees
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              marginTop: 8,
              color: outstanding > 0 ? '#842029' : '#0f5132',
            }}
          >
            {formatCurrency(outstanding, unpaidFees[0]?.currency ?? 'USD')}
          </div>
          <div style={{ fontSize: 12, color: '#777', marginTop: 6 }}>
            {outstanding > 0 ? 'Payment needed' : 'All fees settled'}
          </div>
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>Recent Results</h2>
          <span style={{ color: '#666', fontSize: 12 }}>Latest 5 exams</span>
        </div>

        {recentResults.length === 0 ? (
          <p style={{ marginTop: 12 }}>No exam results yet.</p>
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
              {recentResults.map((result) => (
                <tr key={result.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{result.exam.subject.name}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    {result.exam.name}
                    {result.exam.term ? ` (${result.exam.term})` : ''}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    {formatScore(result.score, result.exam.maxScore)}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{formatDate(result.exam.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
