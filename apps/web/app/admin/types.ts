export type AdminStats = {
  totalStudents: number;
  attendanceRateToday: number;
  presentToday: number;
  feesCollectedMonth: string;
};

export type AdminStatsResponse = { data: AdminStats };

export type RevenuePoint = {
  month: string;
  revenue: number;
};

export type RevenueAnalyticsResponse = { data: RevenuePoint[] };
