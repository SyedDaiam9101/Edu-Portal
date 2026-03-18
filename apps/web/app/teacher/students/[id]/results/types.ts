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

export type TeacherStudentSummary = {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  gradeLevel: string | null;
};

export type TeacherStudentResultsResponse = {
  data: {
    student: TeacherStudentSummary;
    gpa: StudentGpa;
    results: ExamResult[];
  };
};
