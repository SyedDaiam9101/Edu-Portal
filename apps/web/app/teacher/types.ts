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

export type TeacherSubmission = {
  id: string;
  content: string;
  status: 'PENDING' | 'GRADED';
  createdAt: string;
  assignment: {
    id: string;
    title: string;
    dueDate: string;
    subject: { id: string; name: string };
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    gradeLevel: string | null;
  };
};

export type TeacherSubmissionsResponse = { data: TeacherSubmission[] };
