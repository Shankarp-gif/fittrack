/* Attendance Types */
export interface AttendanceRecord {
  id: number
  memberId: number
  memberName: string
  checkInTime: string
  checkOutTime?: string
  attendanceDate: string
  duration?: number // in minutes
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT'
}

export interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  attendancePercentage: number
  currentMonth: string
}

