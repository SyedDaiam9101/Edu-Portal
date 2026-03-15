import type { StudentCreateResponse } from '@edu/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

async function createStudent(formData: FormData) {
  'use server';

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();

  const optional = (key: string) => {
    const value = String(formData.get(key) ?? '').trim();
    return value.length === 0 ? null : value;
  };

  const payload = {
    rollNumber: String(formData.get('rollNumber') ?? ''),
    firstName: String(formData.get('firstName') ?? ''),
    lastName: String(formData.get('lastName') ?? ''),
    email: optional('email'),
    gradeLevel: optional('gradeLevel'),
    section: optional('section'),
    guardianName: optional('guardianName'),
    guardianPhone: optional('guardianPhone'),
    status: String(formData.get('status') ?? 'ACTIVE'),
  };

  const res = await fetch(`${baseUrl}/v1/students`, {
    method: 'POST',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.status === 401 || res.status === 403) redirect('/admin/login');

  if (!res.ok) {
    throw new Error(`Create failed (${res.status})`);
  }

  const json = (await res.json()) as StudentCreateResponse;
  redirect(`/admin/students/${json.data.id}`);
}

export default function AddStudentPage() {
  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ margin: 0 }}>Add student</h1>
      <p style={{ marginTop: 8 }}>
        <Link href="/admin/students">Back</Link>
      </p>

      <form action={createStudent} style={{ marginTop: 16, display: 'grid', gap: 12 }}>
        <label>
          Roll number
          <input name="rollNumber" required style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          First name
          <input name="firstName" required style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Last name
          <input name="lastName" required style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Email (optional)
          <input name="email" type="email" style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Grade level (optional)
          <input name="gradeLevel" style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Section (optional)
          <input name="section" style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Guardian name (optional)
          <input name="guardianName" style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Guardian phone (optional)
          <input name="guardianPhone" style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Status
          <select name="status" defaultValue="ACTIVE" style={{ display: 'block', width: '100%' }}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>

        <button type="submit" style={{ padding: '10px 12px', width: 'fit-content' }}>
          Create
        </button>
      </form>
    </main>
  );
}
