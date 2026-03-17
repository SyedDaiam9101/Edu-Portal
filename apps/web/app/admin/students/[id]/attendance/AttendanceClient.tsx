'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import type { AttendanceCreateResponse, AttendanceRecord, AttendanceStatus } from './types';

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string; bg: string }[] = [
  { value: 'PRESENT', label: 'Present', color: '#0f5132', bg: '#d1e7dd' },
  { value: 'ABSENT', label: 'Absent', color: '#842029', bg: '#f8d7da' },
  { value: 'LATE', label: 'Late', color: '#664d03', bg: '#fff3cd' },
];

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
};

type AttendanceClientProps = {
  studentId: string;
  studentName: string;
  initialRecords: AttendanceRecord[];
};

function dayKey(value: string) {
  const date = new Date(value);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(value: string, withTime = false) {
  const date = new Date(value);
  const options: Intl.DateTimeFormatOptions = withTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function upsertByDay(records: AttendanceRecord[], incoming: AttendanceRecord) {
  const key = dayKey(incoming.date);
  const filtered = records.filter((record) => dayKey(record.date) !== key);
  const next = [incoming, ...filtered];
  return next.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function buildRecentDays(records: AttendanceRecord[], days: number) {
  const today = new Date();
  const latestByDay = new Map<string, AttendanceRecord>();
  for (const record of records) {
    const key = dayKey(record.date);
    if (!latestByDay.has(key)) latestByDay.set(key, record);
  }

  const items: { key: string; label: string; status?: AttendanceStatus }[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = dayKey(date.toISOString());
    const label = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    const record = latestByDay.get(key);
    items.push({ key, label, status: record?.status });
  }
  return items;
}

export default function AttendanceClient({
  studentId,
  studentName,
  initialRecords,
}: AttendanceClientProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [status, setStatus] = useState<AttendanceStatus>('PRESENT');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recentDays = useMemo(() => buildRecentDays(records, 14), [records]);
  const recentRecords = records.slice(0, 12);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    const optimistic: AttendanceRecord = {
      id: `temp-${Date.now()}`,
      date: new Date().toISOString(),
      status,
      studentId,
    };

    setRecords((prev) => upsertByDay(prev, optimistic));

    try {
      const res = await fetch(`${baseUrl}/v1/students/${studentId}/attendance`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (res.status === 401 || res.status === 403) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) {
        throw new Error(`Save failed (${res.status})`);
      }

      const json = (await res.json()) as AttendanceCreateResponse;
      setRecords((prev) => upsertByDay(prev, json.data));
    } catch (err) {
      setRecords((prev) => prev.filter((record) => record.id !== optimistic.id));
      setError('Failed to save attendance. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section style={{ marginTop: 16 }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'end', flexWrap: 'wrap' }}>
        <label style={{ minWidth: 220 }}>
          Mark attendance for today
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as AttendanceStatus)}
            style={{ display: 'block', width: '100%' }}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" style={{ padding: '10px 12px' }} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        {error ? <p style={{ color: '#b02a37', margin: 0 }}>{error}</p> : null}
      </form>

      <div style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Last 14 days</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: 8,
            maxWidth: 560,
          }}
        >
          {recentDays.map((day) => {
            const statusInfo = STATUS_OPTIONS.find((item) => item.value === day.status);
            return (
              <div
                key={day.key}
                style={{
                  border: '1px solid #e5e5e5',
                  padding: 8,
                  borderRadius: 8,
                  background: statusInfo?.bg ?? '#fafafa',
                  color: statusInfo?.color ?? '#444',
                  minHeight: 58,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600 }}>{day.label}</div>
                <div style={{ fontSize: 12 }}>{day.status ? STATUS_LABELS[day.status] : '-'}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Recent history</h3>
        {recentRecords.length === 0 ? (
          <p>No attendance records yet for {studentName}.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Date</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => {
                const statusInfo = STATUS_OPTIONS.find((item) => item.value === record.status);
                return (
                  <tr key={record.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {formatDate(record.date, true)}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: 999,
                          background: statusInfo?.bg ?? '#efefef',
                          color: statusInfo?.color ?? '#333',
                          fontWeight: 600,
                        }}
                      >
                        {STATUS_LABELS[record.status]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
