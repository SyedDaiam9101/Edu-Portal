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

export type StudentResultsResponse = { data: { results: ExamResult[]; gpa: StudentGpa } };

export type ExamListItem = {
  id: string;
  name: string;
  term: string | null;
  date: string;
  maxScore: string;
  gradeLevel: string;
  subject: ExamSubject;
};

export type ExamListResponse = { data: ExamListItem[] };
