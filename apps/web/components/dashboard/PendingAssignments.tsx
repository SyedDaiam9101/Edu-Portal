'use client';

import { useState } from 'react';

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  subject: { id: string; name: string };
  submissions: { id: string; status: 'PENDING' | 'GRADED'; createdAt: string }[];
};

type PendingAssignmentsProps = {
  assignments: Assignment[];
};

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function isUrgent(value: string) {
  const due = new Date(value);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  return diffDays === 0 || diffDays === 1;
}

export default function PendingAssignments({ assignments }: PendingAssignmentsProps) {
  const [items, setItems] = useState(assignments);
  const [openId, setOpenId] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const handleSubmit = async (assignmentId: string) => {
    const value = (content[assignmentId] ?? '').trim();
    if (!value) {
      setError('Please enter your submission content.');
      return;
    }

    setError(null);
    setSubmittingId(assignmentId);

    try {
      const res = await fetch(`${baseUrl}/v1/submissions/hand-in`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assignmentId, content: value }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.message ?? `Failed to submit (${res.status}).`);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === assignmentId
            ? {
                ...item,
                submissions: [
                  {
                    id: payload?.data?.id ?? `temp-${Date.now()}`,
                    status: 'PENDING',
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : item,
        ),
      );
      setOpenId(null);
      setContent((prev) => ({ ...prev, [assignmentId]: '' }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit.');
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
        <h2 style={{ margin: 0, fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>Homework</h2>
        <span style={{ fontSize: 12, color: '#666' }}>{assignments.length} task(s)</span>
      </div>

      {items.length === 0 ? (
        <p style={{ marginTop: 12, color: '#666' }}>No assignments due right now.</p>
      ) : (
        <div style={{ marginTop: 12, display: 'grid', gap: 12 }}>
          {items.map((assignment) => {
            const submission = assignment.submissions?.[0];
            const isSubmitted = Boolean(submission);
            return (
            <div
              key={assignment.id}
              style={{
                border: '1px solid #f0f0f0',
                borderRadius: 12,
                padding: 12,
                display: 'grid',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 600 }}>{assignment.title}</div>
                <div style={{ fontSize: 12, color: '#555' }}>Due {formatDate(assignment.dueDate)}</div>
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>{assignment.subject.name}</div>
              <div style={{ fontSize: 13, color: '#333' }}>{assignment.description}</div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {isUrgent(assignment.dueDate) ? (
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: '#f8d7da',
                      color: '#842029',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    URGENT
                  </span>
                ) : null}

                {isSubmitted ? (
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      padding: '2px 8px',
                      borderRadius: 999,
                      background: submission.status === 'GRADED' ? '#d1e7dd' : '#fff3cd',
                      color: submission.status === 'GRADED' ? '#0f5132' : '#664d03',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {submission.status}
                  </span>
                ) : null}
              </div>

              {!isSubmitted ? (
                <div style={{ marginTop: 8 }}>
                  {openId === assignment.id ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <textarea
                        value={content[assignment.id] ?? ''}
                        onChange={(event) =>
                          setContent((prev) => ({ ...prev, [assignment.id]: event.target.value }))
                        }
                        rows={3}
                        placeholder="Write your submission..."
                        style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #ddd' }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleSubmit(assignment.id)}
                          disabled={submittingId === assignment.id}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: 'none',
                            background: '#111',
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        >
                          {submittingId === assignment.id ? 'Submitting...' : 'Submit'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setOpenId(null)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #ccc',
                            background: '#fff',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenId(assignment.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #111',
                        background: '#fff',
                        fontWeight: 600,
                      }}
                    >
                      Submit
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )})}
        </div>
      )}

      {error ? (
        <p style={{ marginTop: 12, color: '#b00020', background: '#fff0f0', padding: 10 }}>{error}</p>
      ) : null}
    </section>
  );
}
