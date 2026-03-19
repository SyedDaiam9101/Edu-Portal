'use client';

import { useRouter } from 'next/navigation';

type GradeFilterProps = {
  gradeLevel: string | undefined;
};

const GRADE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function GradeFilter({ gradeLevel }: GradeFilterProps) {
  const router = useRouter();

  const handleChange = (value: string) => {
    if (!value) {
      router.push('/admin');
      return;
    }
    const qs = new URLSearchParams({ gradeLevel: value });
    router.push(`/admin?${qs.toString()}`);
  };

  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 12, color: '#666' }}>
      Grade Filter
      <select
        value={gradeLevel ?? ''}
        onChange={(event) => handleChange(event.target.value)}
        style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }}
      >
        <option value="">All grades</option>
        {GRADE_OPTIONS.map((grade) => (
          <option key={grade} value={grade}>
            Grade {grade}
          </option>
        ))}
      </select>
    </label>
  );
}
