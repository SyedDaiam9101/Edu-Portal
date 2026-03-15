export type StudentStatus = 'ACTIVE' | 'INACTIVE';

export type Student = {
  id: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  gradeLevel: string | null;
  section: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type StudentListResponse = {
  data: Student[];
  nextCursor: string | null;
};

export type StudentGetResponse = { data: Student };
export type StudentCreateResponse = { data: Student };
export type StudentUpdateResponse = { data: Student };
export type StudentDeleteResponse = { ok: true };
