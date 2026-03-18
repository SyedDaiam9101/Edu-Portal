import { adminAuthHeaders } from '@/lib/serverAuth';

type Announcement = {
  id: string;
  title: string;
  content: string;
  audience: 'GLOBAL' | 'TEACHERS' | 'STUDENTS';
  createdAt: string;
};

type AnnouncementResponse = { data: Announcement[] };

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(
    date,
  );
}

export default async function DashboardAnnouncement() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
  const headers = await adminAuthHeaders();
  const res = await fetch(`${baseUrl}/v1/announcements/me`, {
    cache: 'no-store',
    headers,
  });

  if (!res.ok) return null;
  const json = (await res.json()) as AnnouncementResponse;
  if (!json.data || json.data.length === 0) return null;

  return (
    <section
      style={{
        borderRadius: 16,
        padding: 16,
        background: 'linear-gradient(180deg, #fff4c2 0%, #ffe7a3 100%)',
        border: '1px solid #f2d375',
        marginTop: 16,
      }}
    >
      {json.data.map((notice) => (
        <div key={notice.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span aria-hidden="true">📢</span>
              <strong style={{ fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>{notice.title}</strong>
            </div>
            <span style={{ fontSize: 12, color: '#6b5a1f' }}>{formatDate(notice.createdAt)}</span>
          </div>
          <p style={{ margin: '6px 0 0', color: '#3a2e06' }}>{notice.content}</p>
        </div>
      ))}
    </section>
  );
}
