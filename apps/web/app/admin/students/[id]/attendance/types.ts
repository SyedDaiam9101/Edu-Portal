export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export type AttendanceRecord = {
  id: string;
  date: string;
  status: AttendanceStatus;
  studentId: string;
};

export type AttendanceListResponse = { data: AttendanceRecord[] };
export type AttendanceCreateResponse = { data: AttendanceRecord };
