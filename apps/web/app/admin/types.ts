export type AdminStats = {
  totalStudents: number;
  attendanceRateToday: number;
  presentToday: number;
  feesCollectedMonth: string;
};

export type AdminStatsResponse = { data: AdminStats };
