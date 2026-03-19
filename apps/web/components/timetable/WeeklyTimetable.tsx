type TimetableEntry = {
  id: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';
  startTime: string;
  endTime: string;
  gradeLevel: string;
  roomNumber: string;
  subject: { id: string; name: string };
  teacher: { id: string; name: string | null; email: string | null };
};

type WeeklyTimetableProps = {
  entries: TimetableEntry[];
};

const DAYS: { key: TimetableEntry['dayOfWeek']; label: string }[] = [
  { key: 'MONDAY', label: 'Monday' },
  { key: 'TUESDAY', label: 'Tuesday' },
  { key: 'WEDNESDAY', label: 'Wednesday' },
  { key: 'THURSDAY', label: 'Thursday' },
  { key: 'FRIDAY', label: 'Friday' },
];

function formatTeacher(teacher: TimetableEntry['teacher']) {
  return teacher.name ?? teacher.email ?? 'Teacher';
}

export default function WeeklyTimetable({ entries }: WeeklyTimetableProps) {
  const byDay = new Map<TimetableEntry['dayOfWeek'], TimetableEntry[]>();
  for (const day of DAYS) {
    byDay.set(day.key, []);
  }
  for (const entry of entries) {
    const list = byDay.get(entry.dayOfWeek) ?? [];
    list.push(entry);
    byDay.set(entry.dayOfWeek, list);
  }

  for (const [key, list] of byDay.entries()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    byDay.set(key, list);
  }

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginTop: 16,
      }}
    >
      {DAYS.map((day) => {
        const slots = byDay.get(day.key) ?? [];
        return (
          <div
            key={day.key}
            style={{
              border: '1px solid #e5e5e5',
              borderRadius: 16,
              padding: 12,
              background: '#fff',
              minHeight: 200,
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
              {day.label}
            </h3>
            {slots.length === 0 ? (
              <p style={{ margin: 0, color: '#777', fontSize: 12 }}>No classes</p>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {slots.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      borderRadius: 12,
                      border: '1px solid #f0f0f0',
                      padding: 10,
                      background: '#f9f9fb',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{entry.subject.name}</div>
                    <div style={{ fontSize: 12, color: '#555' }}>
                      {entry.startTime} - {entry.endTime}
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>{formatTeacher(entry.teacher)}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Room {entry.roomNumber}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
