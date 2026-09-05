export interface MemberReport {
  totalMembers: number
  activeMembers: number
  expiringSoonMembers: number
  expiredMembers: number
  newMembersThisMonth: number
  memberGrowthPercentage: number
}

export interface FinancialReport {
  totalRevenue: number
  thisMonthRevenue: number
  pendingPayments: number
  overduePayments: number
  averageMembershipValue: number
  revenueTrend: Array<{
    month: string
    amount: number
  }>
}

export interface AttendanceReport {
  averageAttendanceRate: number
  thisMonthAttendance: number
  peakHours: Array<{
    hour: string
    count: number
  }>
  dailyAverage: number
}

export interface Report {
  id: number
  name: string
  type: 'MEMBER' | 'FINANCIAL' | 'ATTENDANCE'
  generatedAt: string
  data: MemberReport | FinancialReport | AttendanceReport
}

export interface ReportsResponse {
  memberReport: MemberReport
  financialReport: FinancialReport
  attendanceReport: AttendanceReport
  generatedAt: string
}

