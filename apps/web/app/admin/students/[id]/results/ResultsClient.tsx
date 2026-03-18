'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import type { ExamListItem, ExamResult, StudentGpa } from './types';

type ResultsClientProps = {
  studentId: string;
  studentName: string;
  gradeLevel: string | null;
  initialResults: ExamResult[];
  initialGpa: StudentGpa;
  exams: ExamListItem[];
};

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatScore(score: string, maxScore: string) {
  return `${score} / ${maxScore}`;
}

function scoreToGpa(percent: number) {
  if (percent >= 90) return 4.0;
  if (percent >= 80) return 3.0;
  if (percent >= 70) return 2.0;
  if (percent >= 60) return 1.0;
  return 0.0;
}

function calculateGpa(results: ExamResult[]) {
  let total = 0;
  let count = 0;
  for (const result of results) {
    const score = Number(result.score);
    const maxScore = Number(result.exam.maxScore);
    if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) continue;
    const percent = (score / maxScore) * 100;
    total += scoreToGpa(percent);
    count += 1;
  }
  const gpa = count === 0 ? 0 : Math.round((total / count) * 100) / 100;
  return { gpa, examsTaken: count };
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

function sortResults(results: ExamResult[]) {
  return [...results].sort((a, b) => new Date(b.exam.date).getTime() - new Date(a.exam.date).getTime());
}

export default function ResultsClient({
  studentId,
  studentName,
  gradeLevel,
  initialResults,
  initialGpa,
  exams,
}: ResultsClientProps) {
  const [results, setResults] = useState<ExamResult[]>(sortResults(initialResults));
  const [gpa, setGpa] = useState<StudentGpa>(initialGpa);
  const [examId, setExamId] = useState(exams[0]?.id ?? '');
  const [score, setScore] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  const grouped = useMemo(() => groupBySubject(results), [results]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!examId) {
      setError('Select an exam first.');
      return;
    }

    const selected = exams.find((exam) => exam.id === examId);
    if (!selected) {
      setError('Selected exam not found.');
      return;
    }

    const numericScore = Number(score);
    if (!Number.isFinite(numericScore)) {
      setError('Enter a valid numeric score.');
      return;
    }

    setError(null);
    setIsSaving(true);

    const optimistic: ExamResult = {
      id: `temp-${Date.now()}`,
      studentId,
      score: String(numericScore),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exam: selected,
    };

    setResults((prev) => {
      const next = sortResults([optimistic, ...prev.filter((item) => item.exam.id !== selected.id)]);
      setGpa(calculateGpa(next));
      return next;
    });

    try {
      const res = await fetch(`${baseUrl}/v1/academic/students/${studentId}/results`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ examId, score: numericScore }),
      });
      if (res.status === 401 || res.status === 403) {
        window.location.href = '/admin/login';
        return;
      }

      const json = await res.json();
      if (!res.ok) {
        setResults((prev) => {
          const next = prev.filter((item) => item.id !== optimistic.id);
          setGpa(calculateGpa(next));
          return next;
        });
        setError(json?.message ?? 'Failed to save result.');
        return;
      }

      const saved: ExamResult = json.data;
      setResults((prev) => {
        const filtered = prev.filter((item) => item.id !== optimistic.id && item.exam.id !== saved.exam.id);
        const next = sortResults([saved, ...filtered]);
        setGpa(calculateGpa(next));
        return next;
      });
      setScore('');
    } catch (err) {
      setResults((prev) => {
        const next = prev.filter((item) => item.id !== optimistic.id);
        setGpa(calculateGpa(next));
        return next;
      });
      setError('Failed to save result.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section style={{ marginTop: 16 }}>
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
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: '#5b5b5b' }}>
            Current GPA
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{gpa.gpa.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Based on {gpa.examsTaken} exam{gpa.examsTaken === 1 ? '' : 's'}
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
          Academic Standing
        </div>
      </section>

      <form onSubmit={handleSubmit} style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ minWidth: 240 }}>
          Exam {gradeLevel ? `(Grade ${gradeLevel})` : ''}
          <select
            name="examId"
            value={examId}
            onChange={(event) => setExamId(event.target.value)}
            style={{ display: 'block', width: '100%' }}
            required
          >
            <option value="" disabled>
              Select exam
            </option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.subject.name} - {exam.name}
                {exam.term ? ` (${exam.term})` : ''} - {formatDate(exam.date)}
              </option>
            ))}
          </select>
        </label>
        <label style={{ minWidth: 140 }}>
          Score
          <input
            name="score"
            type="number"
            min="0"
            step="0.01"
            value={score}
            onChange={(event) => setScore(event.target.value)}
            style={{ display: 'block', width: '100%' }}
            required
          />
        </label>
        <button type="submit" style={{ padding: '10px 12px' }} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save result'}
        </button>
        {error ? <p style={{ color: '#b02a37', margin: 0 }}>{error}</p> : null}
      </form>

      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Results by subject</h3>
        {results.length === 0 ? (
          <p>No results recorded yet for {studentName}.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', maxWidth: 900 }}>
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
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      {formatDate(result.exam.date)}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}
