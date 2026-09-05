import { useEffect, useState } from 'react'
import { Calendar, LogIn, LogOut, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { AttendanceRecord, AttendanceStats } from '../types/attendance'
import { attendanceService } from '../services/attendanceService'
import '../styles/AttendancePage.css'

interface TodayAttendance {
  id: number
  status: 'CHECKED_IN' | 'CHECKED_OUT'
  checkInTime: string
  checkOutTime?: string
}

export function AttendancePage() {
  const { user } = useAuth()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  useEffect(() => {
    fetchAttendanceRecords()
  }, [selectedDate])

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const [records, attendanceStats] = await Promise.all([
        attendanceService.getRecordsByDate(selectedDate),
        attendanceService.getStats(),
      ])

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
    }
  }, [user?.id])


  const fetchTodayAttendance = async () => {
    try {
      const attendance = await attendanceService.getTodayAttendance(user?.id || 0)
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

  const handleCheckIn = async () => {
    if (!user?.id) return
    
    setIsCheckingIn(true)
    try {
      const data = await attendanceService.checkIn(user.id)
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
    if (!user?.id) return
    
    setIsCheckingOut(true)
    try {
      const data = await attendanceService.checkOut(user.id)
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
              className={`attendance-action-btn check-in-btn ${todayAttendance?.status === 'CHECKED_IN' ? 'disabled' : ''}`}
              onClick={handleCheckIn}
              disabled={todayAttendance?.status === 'CHECKED_IN' || isCheckingIn}
            >
              <LogIn size={20} />
              <span>{isCheckingIn ? 'Checking In...' : 'Check In'}</span>
            </button>
            <button 
              className={`attendance-action-btn check-out-btn ${todayAttendance?.status !== 'CHECKED_IN' ? 'disabled' : ''}`}
              onClick={handleCheckOut}
              disabled={todayAttendance?.status !== 'CHECKED_IN' || isCheckingOut}
            >
              <LogOut size={20} />
              <span>{isCheckingOut ? 'Checking Out...' : 'Check Out'}</span>
            </button>
          </div>
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
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="loading">Loading...</td>
              </tr>
            ) : !Array.isArray(attendanceRecords) || attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty">No attendance records found</td>
              </tr>
            ) : (
              attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td className="member-name">{record.memberName}</td>
                  <td>{record.checkInTime}</td>
                  <td>{record.checkOutTime || '-'}</td>
                  <td>{record.duration ? `${record.duration} min` : '-'}</td>
                  <td>
                    <span className={`status-badge ${record.status.toLowerCase()}`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button className="action-link">View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
