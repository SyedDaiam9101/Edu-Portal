export type FeeStatus = 'DUE' | 'PAID' | 'OVERDUE' | 'WAIVED';

export type FeeRecord = {
  id: string;
  amount: string;
  currency: string;
  dueDate: string;
  status: FeeStatus;
  paidAt: string | null;
  studentId: string;
  createdAt: string;
  updatedAt: string;
};

export type FeeListResponse = { data: FeeRecord[] };
export type FeeCreateResponse = { data: FeeRecord };
export type FeePayResponse = { data: FeeRecord };
