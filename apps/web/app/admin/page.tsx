import Link from 'next/link';
import { redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';
import DashboardAnnouncement from '@/components/dashboard/DashboardAnnouncement';
import RevenueChart from '@/components/dashboard/RevenueChart';

import type { AdminStatsResponse, RevenueAnalyticsResponse } from './types';
import GradeFilter from './GradeFilter';

export const dynamic = 'force-dynamic';

function formatCurrency(value: string, currency = 'USD') {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return `${value} ${currency}`;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

async function getStats(): Promise<AdminStatsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/admin/stats`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) return { data: { totalStudents: 0, attendanceRateToday: 0, presentToday: 0, feesCollectedMonth: '0' } };
  return (await res.json()) as AdminStatsResponse;
}

async function getRevenueAnalytics(gradeLevel: string | undefined): Promise<RevenueAnalyticsResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const qs = new URLSearchParams();
  if (gradeLevel) qs.set('gradeLevel', gradeLevel);
  const res = await fetch(`${baseUrl}/v1/admin/revenue-analytics?${qs.toString()}`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) return { data: [] };
  return (await res.json()) as RevenueAnalyticsResponse;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ gradeLevel?: string }>;
}) {
  const sp = await searchParams;
  const gradeLevel = (sp.gradeLevel ?? '').trim() || undefined;

  const [stats, revenue] = await Promise.all([getStats(), getRevenueAnalytics(gradeLevel)]);
  const data = stats.data;
  const attendanceLabel = `${data.attendanceRateToday.toFixed(1)}%`;
  const feesLabel = formatCurrency(data.feesCollectedMonth, 'USD');

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ marginTop: 8 }}>
            <Link href="/admin/students">Manage students</Link>
            {' · '}
            <Link href="/admin/timetable">View Full Schedule</Link>
          </p>
        </div>
        <GradeFilter gradeLevel={gradeLevel} />
      </div>

      <DashboardAnnouncement />

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginTop: 20,
          maxWidth: 960,
        }}
      >
        <div
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            padding: 16,
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Total Students
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{data.totalStudents}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Active enrollments</div>
        </div>

        <div
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            padding: 16,
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Attendance Today
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{attendanceLabel}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{data.presentToday} present</div>
        </div>

        <div
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 12,
            padding: 16,
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Fees Collected This Month
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{feesLabel}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>Paid fees only</div>
        </div>
      </section>

      <RevenueChart data={revenue.data} />
    </main>
  );
}
