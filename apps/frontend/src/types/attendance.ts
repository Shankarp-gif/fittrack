/* Attendance Types */
export interface AttendanceRecord {
  id: number
  memberId: number
  memberName: string
  organizationId?: number
  organizationName?: string
  branchId?: number
  branchName?: string
  checkInTime: string
  checkOutTime?: string
  createdAt?: string
  attendanceDate: string
  duration?: number // in minutes
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT'
  recordedByUserId?: number
  recordedByUserName?: string
  supervisorId?: number
  supervisorName?: string
}

export interface AttendanceStats {
  totalDays: number
  presentDays: number
  absentDays: number
  attendancePercentage: number
  currentMonth: string
}

export interface AttendanceDTO {
  id: number
  memberId: number
  memberName: string
  organizationId?: number
  organizationName?: string
  branchId?: number
  branchName?: string
  checkInTime: string
  checkOutTime?: string
  createdAt?: string
  attendanceDate: string
  duration?: number
  status: 'CHECKED_IN' | 'CHECKED_OUT'
  recordedByUserId?: number
  recordedByUserName?: string
  supervisorId?: number
  supervisorName?: string
}

