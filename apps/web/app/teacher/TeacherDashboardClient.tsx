'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import type { TeacherStudent } from './types';

type SortKey = 'rollNumber' | 'name' | 'status';
type SortDir = 'asc' | 'desc';

type TeacherStats = {
  totalStudents: number;
  attendanceRateToday: number;
  classGpaAverage: number;
};

type TeacherDashboardClientProps = {
  students: TeacherStudent[];
  stats: TeacherStats;
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatGpa(value: number) {
  return value.toFixed(2);
}

function statusMeta(status: TeacherStudent['status']) {
  if (status === 'ACTIVE') {
    return { label: 'Active', color: '#0f5132', bg: '#d1e7dd' };
  }
  return { label: 'Inactive', color: '#664d03', bg: '#fff3cd' };
}

function compareValues(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

export default function TeacherDashboardClient({ students, stats }: TeacherDashboardClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>('rollNumber');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sortedStudents = useMemo(() => {
    const data = [...students];
    data.sort((a, b) => {
      let left = '';
      let right = '';
      if (sortKey === 'rollNumber') {
        left = a.rollNumber;
        right = b.rollNumber;
      } else if (sortKey === 'name') {
        left = `${a.firstName} ${a.lastName}`;
        right = `${b.firstName} ${b.lastName}`;
      } else {
        left = a.status;
        right = b.status;
      }
      const result = compareValues(left, right);
      return sortDir === 'asc' ? result : -result;
    });
    return data;
  }, [students, sortKey, sortDir]);

  const toggleSort = (nextKey: SortKey) => {
    if (nextKey === sortKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(nextKey);
      setSortDir('asc');
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (key !== sortKey) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <section style={{ marginTop: 20 }}>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginTop: 16,
          maxWidth: 960,
        }}
      >
        <div
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 14,
            padding: 16,
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Total Students
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{stats.totalStudents}</div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 6 }}>Active roster</div>
        </div>

        <div
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 14,
            padding: 16,
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Today&apos;s Attendance
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>
            {formatPercent(stats.attendanceRateToday)}
          </div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 6 }}>Present today</div>
        </div>

        <div
          style={{
            border: '1px solid #e5e5e5',
            borderRadius: 14,
            padding: 16,
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            Class GPA Average
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8 }}>{formatGpa(stats.classGpaAverage)}</div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 6 }}>4.0 scale</div>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>My Class</h2>
          <Link
            href="/teacher/attendance"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 999,
              background: '#111',
              color: '#fff',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Take Class Attendance
          </Link>
        </div>

        {sortedStudents.length === 0 ? (
          <p style={{ marginTop: 16 }}>No students are assigned to your class yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleSort('rollNumber')}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                  >
                    Roll # {sortIndicator('rollNumber')}
                  </button>
                </th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleSort('name')}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                  >
                    Student {sortIndicator('name')}
                  </button>
                </th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>
                  <button
                    type="button"
                    onClick={() => toggleSort('status')}
                    style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
                  >
                    Status {sortIndicator('status')}
                  </button>
                </th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }} />
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((student) => {
                const badge = statusMeta(student.status);
                return (
                  <tr key={student.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{student.rollNumber}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {student.firstName} {student.lastName}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: badge.bg,
                          color: badge.color,
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      <Link
                        href={`/teacher/students/${student.id}/results`}
                        style={{
                          display: 'inline-block',
                          padding: '6px 12px',
                          borderRadius: 999,
                          border: '1px solid #111',
                          textDecoration: 'none',
                          color: '#111',
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        View Results
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}
