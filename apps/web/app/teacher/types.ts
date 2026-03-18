export type TeacherStudent = {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  gradeLevel: string | null;
  section: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
};

export type TeacherClassListResponse = { data: TeacherStudent[] };

export type TeacherClassAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type TeacherClassAttendanceTodayResponse = {
  data: {
    statuses: Record<string, TeacherClassAttendanceStatus>;
    count: number;
  };
};
