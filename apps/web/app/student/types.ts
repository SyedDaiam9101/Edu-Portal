export type StudentSummary = {
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
  deletedAt: string | null;
};

export type ExamSubject = {
  id: string;
  name: string;
  gradeLevel: string;
};

export type ExamSummary = {
  id: string;
  name: string;
  term: string | null;
  date: string;
  maxScore: string;
  gradeLevel: string;
  subject: ExamSubject;
};

export type ExamResult = {
  id: string;
  studentId: string;
  score: string;
  createdAt: string;
  updatedAt: string;
  exam: ExamSummary;
};

export type StudentGpa = {
  gpa: number;
  examsTaken: number;
};

export type FeeRecord = {
  id: string;
  amount: string;
  currency: string;
  dueDate: string;
  status: 'DUE' | 'OVERDUE' | 'PAID' | 'WAIVED';
  paidAt: string | null;
  studentId: string;
  createdAt: string;
  updatedAt: string;
};

export type StudentDashboardResponse = {
  data: {
    student: StudentSummary;
    gpa: StudentGpa;
    results: ExamResult[];
    unpaidFees: FeeRecord[];
  };
};
