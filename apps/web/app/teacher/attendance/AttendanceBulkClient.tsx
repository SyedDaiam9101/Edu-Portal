'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import type { TeacherStudent } from '../types';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

const STATUS_META: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  PRESENT: { label: 'Present', color: '#0f5132', bg: '#d1e7dd' },
  ABSENT: { label: 'Absent', color: '#842029', bg: '#f8d7da' },
  LATE: { label: 'Late', color: '#664d03', bg: '#fff3cd' },
};

type AttendanceBulkClientProps = {
  students: TeacherStudent[];
  initialStatuses: Record<string, AttendanceStatus>;
  hasExistingAttendance: boolean;
};

function formatName(student: TeacherStudent) {
  return `${student.firstName} ${student.lastName}`;
}

export default function AttendanceBulkClient({
  students,
  initialStatuses,
  hasExistingAttendance,
}: AttendanceBulkClientProps) {
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() =>
    Object.fromEntries(students.map((student) => [student.id, initialStatuses[student.id] ?? 'PRESENT'])),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const summary = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    for (const student of students) {
      counts[statuses[student.id] ?? 'PRESENT'] += 1;
    }
    return counts;
  }, [students, statuses]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    setStatuses(Object.fromEntries(students.map((student) => [student.id, 'PRESENT'])));
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    const records = students.map((student) => ({
      studentId: student.id,
      status: statuses[student.id] ?? 'PRESENT',
    }));

    try {
      const res = await fetch(`${baseUrl}/v1/teacher/bulk-attendance`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ records }),
      });

      const payload = await res.json().catch(() => null);
      if (res.status === 401 || res.status === 403) {
        router.replace('/login');
        return;
      }

      if (!res.ok) {
        setError(payload?.message ?? `Failed to submit attendance (${res.status}).`);
        return;
      }

      router.replace('/teacher');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ marginTop: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Today&apos;s Attendance</h2>
          <p style={{ margin: '6px 0 0', color: '#666' }}>
            Present: {summary.PRESENT} · Absent: {summary.ABSENT} · Late: {summary.LATE}
          </p>
          {hasExistingAttendance ? (
            <p style={{ margin: '6px 0 0', color: '#555', fontSize: 12 }}>
              Attendance for today has already been recorded. You can update it below.
            </p>
          ) : null}
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleMarkAllPresent}
            style={{
              padding: '10px 16px',
              borderRadius: 999,
              border: '1px solid #111',
              background: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || students.length === 0}
            style={{
              padding: '10px 16px',
              borderRadius: 999,
              border: 'none',
              background: '#111',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {submitting ? 'Submitting...' : "Submit Today\u2019s Attendance"}
          </button>
        </div>
      </div>

      {error ? (
        <p style={{ margin: '0 0 16px', color: '#b00020', background: '#fff0f0', padding: 10 }}>
          {error}
        </p>
      ) : null}

      {students.length === 0 ? (
        <p>No students are assigned to your class yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Roll #</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Student</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{student.rollNumber}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{formatName(student)}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'inline-flex', gap: 6, padding: 4, borderRadius: 999, background: '#f3f3f3' }}>
                    {(Object.keys(STATUS_META) as AttendanceStatus[]).map((status) => {
                      const meta = STATUS_META[status];
                      const active = statuses[student.id] === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleStatusChange(student.id, status)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 999,
                            border: active ? '1px solid #111' : '1px solid transparent',
                            background: active ? meta.bg : 'transparent',
                            color: active ? meta.color : '#444',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
