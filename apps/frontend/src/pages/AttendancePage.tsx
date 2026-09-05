import { useState, useEffect } from 'react'
import { LogIn, LogOut, Calendar, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { AttendanceRecord, AttendanceStats } from '../types/attendance'
import '../styles/AttendancePage.css'

export function AttendancePage() {
  const { user } = useAuth()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  // Simulated data - replace with actual API calls
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockRecords: AttendanceRecord[] = [
        {
          id: 1,
          memberId: 1,
          memberName: 'John Doe',
          checkInTime: '06:30 AM',
          checkOutTime: '07:45 AM',
          attendanceDate: selectedDate,
          duration: 75,
          status: 'CHECKED_OUT'
        },
        {
          id: 2,
          memberId: 2,
          memberName: 'Jane Smith',
          checkInTime: '07:00 AM',
          checkOutTime: undefined,
          attendanceDate: selectedDate,
          status: 'CHECKED_IN'
        }
      ]

      const mockStats: AttendanceStats = {
        totalDays: 22,
        presentDays: 20,
        absentDays: 2,
        attendancePercentage: 90.9,
        currentMonth: 'September 2026'
      }

      setAttendanceRecords(mockRecords)
      setStats(mockStats)
      setLoading(false)
    }, 500)
  }, [selectedDate])

  const handleCheckIn = () => {
    alert('Check-in successful at ' + new Date().toLocaleTimeString())
  }

  const handleCheckOut = () => {
    alert('Check-out successful at ' + new Date().toLocaleTimeString())
  }

  return (
    <div className="attendance-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track and manage gym member attendance</p>
        </div>
      </div>

      {/* Quick Actions for Members */}
      {user?.role === 'USER' && (
        <div className="quick-actions">
          <button className="action-btn check-in-btn" onClick={handleCheckIn}>
            <LogIn size={20} />
            <span>Check In</span>
          </button>
          <button className="action-btn check-out-btn" onClick={handleCheckOut}>
            <LogOut size={20} />
            <span>Check Out</span>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon present">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>Total Days</h3>
              <p className="stat-value">{stats.totalDays}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon success">
              <LogIn size={24} />
            </div>
            <div className="stat-content">
              <h3>Present Days</h3>
              <p className="stat-value">{stats.presentDays}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon warning">
              <LogOut size={24} />
            </div>
            <div className="stat-content">
              <h3>Absent Days</h3>
              <p className="stat-value">{stats.absentDays}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon info">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Attendance %</h3>
              <p className="stat-value">{stats.attendancePercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="filter-section">
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-input"
        />
      </div>

      {/* Attendance Table */}
      <div className="table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Check-In Time</th>
              <th>Check-Out Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="loading">Loading...</td>
              </tr>
            ) : attendanceRecords.length === 0 ? (
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
                      {record.status}
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

