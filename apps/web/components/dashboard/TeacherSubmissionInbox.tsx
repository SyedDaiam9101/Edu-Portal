'use client';

import { useMemo, useState } from 'react';

import type { TeacherSubmission } from '@/app/teacher/types';

type TeacherSubmissionInboxProps = {
  submissions: TeacherSubmission[];
};

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    date,
  );
}

export default function TeacherSubmissionInbox({ submissions }: TeacherSubmissionInboxProps) {
  const [items, setItems] = useState(submissions);
  const [openId, setOpenId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const pending = useMemo(() => items.filter((item) => item.status === 'PENDING'), [items]);
  const recent = pending.slice(0, 6);
  const active = openId ? items.find((item) => item.id === openId) ?? null : null;

  const handleMarkReviewed = async (submissionId: string) => {
    setError(null);
    setSubmittingId(submissionId);
    try {
      const res = await fetch(`${baseUrl}/v1/submissions/${submissionId}/grade`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.message ?? `Failed to mark as reviewed (${res.status}).`);
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== submissionId));
      setOpenId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as reviewed.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <section
      style={{
        borderRadius: 16,
        padding: 16,
        border: '1px solid #e5e5e5',
        background: '#fff',
        marginTop: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>Recent Hand-Ins</h2>
        <span style={{ fontSize: 12, color: '#666' }}>{recent.length} submission(s)</span>
      </div>

      {recent.length === 0 ? (
        <p style={{ marginTop: 12, color: '#666' }}>No submissions yet.</p>
      ) : (
        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          {recent.map((submission) => (
            <div
              key={submission.id}
              style={{
                border: '1px solid #f0f0f0',
                borderRadius: 12,
                padding: 12,
                display: 'grid',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong>
                  {submission.student.firstName} {submission.student.lastName}
                </strong>
                <span style={{ fontSize: 12, color: '#555' }}>{formatDate(submission.createdAt)}</span>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                {submission.assignment.subject.name} · {submission.assignment.title}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span
                  style={{
                    alignSelf: 'flex-start',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: '#fff3cd',
                    color: '#664d03',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  PENDING
                </span>
                <span style={{ fontSize: 12, color: '#666' }}>Roll #{submission.student.rollNumber}</span>
                <button
                  type="button"
                  onClick={() => setOpenId(submission.id)}
                  style={{
                    marginLeft: 'auto',
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #111',
                    background: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <p style={{ marginTop: 12, color: '#b00020', background: '#fff0f0', padding: 10 }}>{error}</p>
      ) : null}

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 50,
          }}
          onClick={() => setOpenId(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 20,
              maxWidth: 560,
              width: '100%',
              display: 'grid',
              gap: 12,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <h3 style={{ margin: 0, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
                {active.student.firstName} {active.student.lastName}
              </h3>
              <p style={{ marginTop: 4, color: '#666' }}>
                {active.assignment.subject.name} · {active.assignment.title}
              </p>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', color: '#333', background: '#fafafa', padding: 12, borderRadius: 10 }}>
              {active.content}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setOpenId(null)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#fff' }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleMarkReviewed(active.id)}
                disabled={submittingId === active.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#111',
                  color: '#fff',
                  fontWeight: 600,
                }}
              >
                {submittingId === active.id ? 'Saving...' : 'Mark as Reviewed'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
