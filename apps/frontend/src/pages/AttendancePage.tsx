import { useEffect, useState } from 'react'
import { Calendar, LogIn, LogOut, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { AttendanceRecord, AttendanceStats } from '../types/attendance'
import { attendanceService } from '../services/attendanceService'
import { membersService } from '../services/membersService'
import '../styles/AttendancePage.css'

interface TodayAttendance {
  id: number
  status: 'CHECKED_IN' | 'CHECKED_OUT'
  checkInTime: string
  checkOutTime?: string
}

interface AttendanceDetailsModalData {
  memberName: string
  memberId: number
  organizationName: string
  organizationId: string
  branchName: string
  branchId: string
  attendanceDate: string
  createdAt: string
  checkInTime: string
  checkOutTime: string
  durationText: string
  status: string
  recordedByUserName: string
  recordedByUserId: string
  supervisorName: string
}

export function AttendancePage() {
  const { user } = useAuth()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null)
  const [memberIdForCheckin, setMemberIdForCheckin] = useState<number | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null)

  const canCheckIn = !todayAttendance
  const canCheckOut = todayAttendance?.status === 'CHECKED_IN'
  const checkInTitle = canCheckIn
    ? 'Mark today\'s check-in'
    : 'Daily attendance already completed. Check-in is available again tomorrow.'
  const checkOutTitle = canCheckOut
    ? 'Mark today\'s check-out'
    : 'Check-out is available only after a successful check-in.'

  useEffect(() => {
    fetchAttendanceRecords()
  }, [selectedDate, user?.id, user?.role, memberIdForCheckin])

  const resolveMemberIdForUser = async (): Promise<number | null> => {
    if (memberIdForCheckin) {
      return memberIdForCheckin
    }

    if (!user?.email || user?.role !== 'USER') {
      return null
    }

    const member = await membersService.getMemberByEmail(user.email)
    if (!member?.id) {
      return null
    }

    setMemberIdForCheckin(member.id)
    return member.id
  }

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const recordsPromise = attendanceService.getRecordsByDate(selectedDate)

      let attendanceStats: AttendanceStats | null = null
      if (user?.role === 'USER') {
        const memberId = await resolveMemberIdForUser()
        if (memberId) {
          attendanceStats = await attendanceService.getStats(memberId, selectedDate)
        }
      }

      const records = await recordsPromise

      setAttendanceRecords(Array.isArray(records) ? records : [])
      setStats(
        attendanceStats || {
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          attendancePercentage: 0,
          currentMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        },
      )
    } catch (error) {
      console.error('Error fetching attendance records:', error)
      setAttendanceRecords([])
      setStats({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        attendancePercentage: 0,
        currentMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch today's attendance status on mount
  useEffect(() => {
    if (user?.id) {
      fetchTodayAttendance()
      // If user is a member, fetch their member ID
      if (user?.role === 'USER') {
        fetchMemberIdForUser()
      }
    }
  }, [user?.id, user?.role])

  const fetchMemberIdForUser = async () => {
    try {
      const memberId = await resolveMemberIdForUser()
      if (!memberId) {
        console.error('Member ID not found for user')
      }
    } catch (error) {
      console.error('Error fetching member ID:', error)
    }
  }


  const fetchTodayAttendance = async () => {
    try {
      const memberId = await resolveMemberIdForUser()

      if (!memberId) {
        console.error('No member ID found for user')
        return
      }

      const attendance = await attendanceService.getTodayAttendance(memberId)
      if (attendance) {
        setTodayAttendance({
          id: attendance.id,
          status: attendance.status,
          checkInTime: formatTime(attendance.checkInTime),
          checkOutTime: attendance.checkOutTime ? formatTime(attendance.checkOutTime) : undefined,
        })
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error)
    }
  }

  const formatTime = (dateTimeString: string): string => {
    const date = new Date(dateTimeString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getDurationMinutes = (record: AttendanceRecord): number | null => {
    if (typeof record.duration === 'number' && Number.isFinite(record.duration)) {
      return Math.max(0, Math.floor(record.duration))
    }

    if (!record.checkOutTime || !record.checkInTime) {
      return null
    }

    const checkIn = new Date(record.checkInTime).getTime()
    const checkOut = new Date(record.checkOutTime).getTime()

    if (Number.isNaN(checkIn) || Number.isNaN(checkOut) || checkOut < checkIn) {
      return null
    }

    return Math.floor((checkOut - checkIn) / (1000 * 60))
  }

  const formatDurationRange = (minutes: number): string => {
    if (minutes < 60) return '<1 hour'
    if (minutes < 120) return '1-2 hours'
    if (minutes < 180) return '2-3 hours'
    if (minutes < 240) return '3-4 hours'
    return '>4 hours'
  }

  const formatDateTimeValue = (value?: string): string => {
    if (!value) return '-'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return value
    return parsed.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const getDetailsData = (record: AttendanceRecord): AttendanceDetailsModalData => {
    const durationMinutes = getDurationMinutes(record)
    const durationText = durationMinutes !== null
      ? `${formatDurationRange(durationMinutes)} (${durationMinutes} min)`
      : '-'

    return {
      memberName: record.memberName,
      memberId: record.memberId,
      organizationName: record.organizationName || '-',
      organizationId: record.organizationId ? String(record.organizationId) : '-',
      branchName: record.branchName || '-',
      branchId: record.branchId ? String(record.branchId) : '-',
      attendanceDate: record.attendanceDate,
      createdAt: formatDateTimeValue(record.createdAt),
      checkInTime: formatDateTimeValue(record.checkInTime),
      checkOutTime: formatDateTimeValue(record.checkOutTime),
      durationText,
      status: record.status.replace('_', ' '),
      recordedByUserName: record.recordedByUserName || '-',
      recordedByUserId: record.recordedByUserId ? String(record.recordedByUserId) : '-',
      supervisorName: record.supervisorName || '-',
    }
  }

   const handleCheckIn = async () => {
    if (!memberIdForCheckin) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Member ID not found. Please refresh and try again.',
        type: 'error',
        duration: 3000,
      })
      return
    }

    setIsCheckingIn(true)
    try {
      const data = await attendanceService.checkIn(memberIdForCheckin)
      const checkInTime = formatTime(data.checkInTime)

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Checked In!',
        message: `Successfully checked in at ${checkInTime}`,
        type: 'success',
        duration: 4000,
      })

      setTodayAttendance({
        id: data.id,
        status: 'CHECKED_IN',
        checkInTime,
      })
      await fetchAttendanceRecords()
    } catch (error) {
      console.error('Error during check-in:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error during check-in. Please try again.'

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Check-in Failed',
        message: errorMsg,
        type: 'error',
        duration: 4000,
      })
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!memberIdForCheckin) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Member ID not found. Please refresh and try again.',
        type: 'error',
        duration: 3000,
      })
      return
    }

    setIsCheckingOut(true)
    try {
      const data = await attendanceService.checkOut(memberIdForCheckin)
      const checkOutTime = formatTime(data.checkOutTime || '')

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Checked Out!',
        message: `Successfully checked out at ${checkOutTime}`,
        type: 'success',
        duration: 4000,
      })

      setTodayAttendance({
        id: data.id,
        status: 'CHECKED_OUT',
        checkInTime: formatTime(data.checkInTime),
        checkOutTime,
      })
      await fetchAttendanceRecords()
    } catch (error) {
      console.error('Error during check-out:', error)
      const errorMsg = error instanceof Error ? error.message : 'Error during check-out. Please try again.'

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Check-out Failed',
        message: errorMsg,
        type: 'error',
        duration: 4000,
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="attendance-page role-dashboard-page">

      <div className="page-header role-dashboard-header attendance-header-card role-dashboard-card">
        <div>
          <h1 className="page-title role-dashboard-title">Attendance Management</h1>
          <p className="page-subtitle role-dashboard-subtitle">Track and manage gym member attendance</p>
        </div>
        {stats && <div className="attendance-month-pill">{stats.currentMonth}</div>}
      </div>

      {user?.role === 'USER' && (
        <div className="quick-actions role-dashboard-card">
          <div className="quick-actions-title">Quick Attendance</div>
          <div className="quick-actions-buttons">
            <button 
              className={`attendance-action-btn check-in-btn ${!canCheckIn ? 'disabled' : ''}`}
              onClick={handleCheckIn}
              disabled={!canCheckIn || isCheckingIn}
              title={checkInTitle}
            >
              <LogIn size={20} />
              <span>{isCheckingIn ? 'Checking In...' : 'Check In'}</span>
            </button>
            <button 
              className={`attendance-action-btn check-out-btn ${!canCheckOut ? 'disabled' : ''}`}
              onClick={handleCheckOut}
              disabled={!canCheckOut || isCheckingOut}
              title={checkOutTitle}
            >
              <LogOut size={20} />
              <span>{isCheckingOut ? 'Checking Out...' : 'Check Out'}</span>
            </button>
          </div>
          {!canCheckIn && todayAttendance?.status === 'CHECKED_OUT' && (
            <p className="attendance-rule-note">Daily attendance already completed. You can check in again tomorrow.</p>
          )}
          {!canCheckIn && canCheckOut && (
            <p className="attendance-rule-note">You are checked in. Complete checkout to close today's attendance.</p>
          )}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card role-dashboard-card">
          <div className="stat-icon present">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Days</h3>
            <p className="stat-value">{stats?.totalDays ?? 0}</p>
          </div>
        </div>

        <div className="stat-card role-dashboard-card">
          <div className="stat-icon success">
            <LogIn size={24} />
          </div>
          <div className="stat-content">
            <h3>Present Days</h3>
            <p className="stat-value">{stats?.presentDays ?? 0}</p>
          </div>
        </div>

        <div className="stat-card role-dashboard-card">
          <div className="stat-icon warning">
            <LogOut size={24} />
          </div>
          <div className="stat-content">
            <h3>Absent Days</h3>
            <p className="stat-value">{stats?.absentDays ?? 0}</p>
          </div>
        </div>

        <div className="stat-card role-dashboard-card">
          <div className="stat-icon info">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>Attendance %</h3>
            <p className="stat-value">{(stats?.attendancePercentage ?? 0).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="filter-section role-dashboard-card">
        <label htmlFor="attendance-date" className="filter-label">Select Date</label>
        <input
          id="attendance-date"
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="date-input"
        />
      </div>

      <div className="table-container role-dashboard-card">
        <table className="attendance-table">
          <thead>
            <tr>
              <th scope="col">Member Name</th>
              <th scope="col">Check-In Time</th>
              <th scope="col">Check-Out Time</th>
              <th scope="col">Duration</th>
              <th scope="col">Status</th>
              {user?.role !== 'USER' && <th scope="col">Supervisor</th>}
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={user?.role !== 'USER' ? 7 : 6} className="loading">Loading...</td>
              </tr>
            ) : !Array.isArray(attendanceRecords) || attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan={user?.role !== 'USER' ? 7 : 6} className="empty">
                  {user?.role === 'USER' ? 'No attendance records found' : 'No attendance records for your team'}
                </td>
              </tr>
            ) : (
              attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td className="member-name">{record.memberName}</td>
                  <td>{record.checkInTime}</td>
                  <td>{record.checkOutTime || '-'}</td>
                  <td>
                    {(() => {
                      const durationMinutes = getDurationMinutes(record)
                      return durationMinutes !== null
                        ? `${formatDurationRange(durationMinutes)} (${durationMinutes} min)`
                        : '-'
                    })()}
                  </td>
                  <td>
                    <span className={`status-badge ${record.status.toLowerCase()}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  {user?.role !== 'USER' && (
                    <td>{record.supervisorName || '-'}</td>
                  )}
                  <td>
                    <button className="action-link" onClick={() => setSelectedRecord(record)}>View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedRecord && (
        <div className="attendance-details-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="attendance-details-modal" onClick={(event) => event.stopPropagation()}>
            <div className="attendance-details-header">
              <h3>Attendance Details</h3>
              <button
                type="button"
                className="attendance-details-close"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close details"
              >
                x
              </button>
            </div>
            {(() => {
              const details = getDetailsData(selectedRecord)
              return (
                <div className="attendance-details-grid">
                  <p><strong>Member Name:</strong> {details.memberName}</p>
                  <p><strong>Member ID:</strong> {details.memberId}</p>
                  <p><strong>Organization:</strong> {details.organizationName}</p>
                  <p><strong>Organization ID:</strong> {details.organizationId}</p>
                  <p><strong>Branch:</strong> {details.branchName}</p>
                  <p><strong>Branch ID:</strong> {details.branchId}</p>
                  <p><strong>Attendance Date:</strong> {details.attendanceDate}</p>
                  <p><strong>Recorded At:</strong> {details.createdAt}</p>
                  <p><strong>Check-In:</strong> {details.checkInTime}</p>
                  <p><strong>Check-Out:</strong> {details.checkOutTime}</p>
                  <p><strong>Duration:</strong> {details.durationText}</p>
                  <p><strong>Status:</strong> {details.status}</p>
                  <p><strong>Recorded By:</strong> {details.recordedByUserName} (ID: {details.recordedByUserId})</p>
                  {user?.role !== 'USER' && <p><strong>Supervisor:</strong> {details.supervisorName}</p>}
                </div>
              )
            })()}
          </div>
        </div>
      )}

    </div>
  )
}
