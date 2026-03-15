import type { StudentGetResponse, StudentUpdateResponse } from '@edu/types';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { adminAuthHeaders } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

async function getStudent(id: string): Promise<StudentGetResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/students/${id}`, {
    cache: 'no-store',
    headers,
  });
  if (res.status === 401 || res.status === 403) {
    redirect('/admin/login');
  }
  if (!res.ok) return null;
  return (await res.json()) as StudentGetResponse;
}

async function updateStudent(id: string, formData: FormData) {
  'use server';

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const optional = (key: string) => {
    const value = String(formData.get(key) ?? '').trim();
    return value.length === 0 ? null : value;
  };
  const payload = {
    firstName: String(formData.get('firstName') ?? ''),
    lastName: String(formData.get('lastName') ?? ''),
    email: optional('email'),
    gradeLevel: optional('gradeLevel'),
    section: optional('section'),
    guardianName: optional('guardianName'),
    guardianPhone: optional('guardianPhone'),
    status: String(formData.get('status') ?? 'ACTIVE'),
  };

  const res = await fetch(`${baseUrl}/v1/students/${id}`, {
    method: 'PATCH',
    headers: { ...headers, 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.status === 401 || res.status === 403) redirect('/admin/login');
  if (!res.ok) throw new Error(`Update failed (${res.status})`);

  const json = (await res.json()) as StudentUpdateResponse;
  redirect(`/admin/students/${json.data.id}`);
}

async function deleteStudent(id: string) {
  'use server';

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/students/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (res.status === 401 || res.status === 403) redirect('/admin/login');
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
  redirect('/admin/students');
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getStudent(id);
  if (!student) notFound();

  const s = student.data;

  return (
    <main style={{ padding: 24, maxWidth: 720 }}>
      <h1 style={{ margin: 0 }}>
        {s.firstName} {s.lastName}
      </h1>
      <p style={{ marginTop: 8 }}>
        <Link href="/admin/students">Back</Link>
      </p>
      <p style={{ marginTop: 8 }}>
        Roll #: <code>{s.rollNumber}</code>
      </p>

      <form
        action={updateStudent.bind(null, s.id)}
        style={{ marginTop: 16, display: 'grid', gap: 12 }}
      >
        <label>
          First name
          <input name="firstName" defaultValue={s.firstName} required style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Last name
          <input name="lastName" defaultValue={s.lastName} required style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Email
          <input name="email" type="email" defaultValue={s.email ?? ''} style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Grade level
          <input name="gradeLevel" defaultValue={s.gradeLevel ?? ''} style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Section
          <input name="section" defaultValue={s.section ?? ''} style={{ display: 'block', width: '100%' }} />
        </label>
        <label>
          Guardian name
          <input
            name="guardianName"
            defaultValue={s.guardianName ?? ''}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label>
          Guardian phone
          <input
            name="guardianPhone"
            defaultValue={s.guardianPhone ?? ''}
            style={{ display: 'block', width: '100%' }}
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={s.status} style={{ display: 'block', width: '100%' }}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" style={{ padding: '10px 12px' }}>
            Save
          </button>
          <button
            type="submit"
            formAction={deleteStudent.bind(null, s.id)}
            style={{ padding: '10px 12px' }}
          >
            Delete
          </button>
        </div>
      </form>
    </main>
  );
}
