import { useState, useEffect } from 'react'
import {
  CheckCircle,
  Calendar,
  TrendingUp,
  Dumbbell,
  Target,
  Clock,
  Award,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../styles/MemberDashboard.css'

interface MemberStats {
  currentMembership: {
    planName: string
    daysRemaining: number
    endDate: string
  }
  thisMonthAttendance: {
    days: number
    percentage: number
  }
  thisMonthStats: {
    workoutsCompleted: number
    personalTrainingSessions: number
    totalMinutes: number
    caloriesBurned: number
  }
  nextFeePayment: {
    amount: number
    dueDate: string
    status: 'PAID' | 'PENDING' | 'OVERDUE'
  }
}

export function MemberDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Membership Expiring Soon',
      message: 'Your membership expires in 7 days. Renew now!',
      type: 'warning',
      read: false,
    },
    {
      id: 2,
      title: 'Great Attendance!',
      message: 'You have attended 90% this month. Keep it up!',
      type: 'success',
      read: false,
    },
    {
      id: 3,
      title: 'Fee Payment Reminder',
      message: 'Your monthly fee of ₹3,999 is due on September 5th',
      type: 'info',
      read: false,
    },
  ])

  useEffect(() => {
    setTimeout(() => {
      const mockStats: MemberStats = {
        currentMembership: {
          planName: '30 Days Monthly Plan',
          daysRemaining: 7,
          endDate: '2026-09-30',
        },
        thisMonthAttendance: {
          days: 20,
          percentage: 90,
        },
        thisMonthStats: {
          workoutsCompleted: 20,
          personalTrainingSessions: 4,
          totalMinutes: 1200,
          caloriesBurned: 4500,
        },
        nextFeePayment: {
          amount: 3999,
          dueDate: '2026-09-05',
          status: 'PENDING',
        },
      }
      setStats(mockStats)
    }, 500)
  }, [])

  const handleCheckIn = () => {
    alert('Check-in successful! Welcome to the gym!')
  }

  const handleMarkRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    )
  }

  return (
    <div className="member-dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Welcome back, {user?.fullName}! 💪</h1>
          <p className="welcome-subtitle">Track your fitness journey and stay motivated</p>
        </div>
        <button className="check-in-btn" onClick={handleCheckIn}>
          <CheckCircle size={20} />
          Check In Now
        </button>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="quick-stats">
          <div className="stat-box membership">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <h3>Active Membership</h3>
              <p className="stat-main">{stats.currentMembership.planName}</p>
              <p className="stat-sub">
                <span className="highlight">{stats.currentMembership.daysRemaining} days</span> remaining
              </p>
            </div>
          </div>

          <div className="stat-box attendance">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>This Month Attendance</h3>
              <p className="stat-main">{stats.thisMonthAttendance.days} Days</p>
              <p className="stat-sub">{stats.thisMonthAttendance.percentage}% attendance rate</p>
            </div>
          </div>

          <div className="stat-box payment">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>Fee Payment</h3>
              <p className="stat-main">₹{stats.nextFeePayment.amount}</p>
              <p className="stat-sub">Due: {new Date(stats.nextFeePayment.dueDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="stat-box goals">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <h3>Monthly Goals</h3>
              <p className="stat-main">90% Complete</p>
              <p className="stat-sub">Keep pushing to reach 100%!</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="member-content-grid">
        {/* Left Column - Stats and Progress */}
        <div className="left-column">
          {/* Performance Stats */}
          {stats && (
            <div className="performance-card">
              <div className="card-header">
                <h2>This Month Performance</h2>
                <span className="badge">Sep 2026</span>
              </div>

              <div className="performance-grid">
                <div className="performance-item">
                  <div className="perf-icon workout">
                    <Dumbbell size={24} />
                  </div>
                  <div className="perf-content">
                    <h4>Workouts</h4>
                    <p className="perf-value">{stats.thisMonthStats.workoutsCompleted}</p>
                    <p className="perf-label">sessions completed</p>
                  </div>
                </div>

                <div className="performance-item">
                  <div className="perf-icon training">
                    <Target size={24} />
                  </div>
                  <div className="perf-content">
                    <h4>PT Sessions</h4>
                    <p className="perf-value">{stats.thisMonthStats.personalTrainingSessions}/8</p>
                    <p className="perf-label">sessions used</p>
                  </div>
                </div>

                <div className="performance-item">
                  <div className="perf-icon time">
                    <Clock size={24} />
                  </div>
                  <div className="perf-content">
                    <h4>Total Time</h4>
                    <p className="perf-value">{Math.floor(stats.thisMonthStats.totalMinutes / 60)}h</p>
                    <p className="perf-label">{stats.thisMonthStats.totalMinutes} minutes</p>
                  </div>
                </div>

                <div className="performance-item">
                  <div className="perf-icon calories">
                    <TrendingUp size={24} />
                  </div>
                  <div className="perf-content">
                    <h4>Calories</h4>
                    <p className="perf-value">{stats.thisMonthStats.caloriesBurned}</p>
                    <p className="perf-label">kcal burned</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div className="progress-card">
            <div className="card-header">
              <h2>Monthly Goals Progress</h2>
            </div>

            <div className="goal-items">
              <div className="goal-item">
                <div className="goal-header">
                  <span className="goal-name">Attendance Target</span>
                  <span className="goal-percent">90%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '90%' }}></div>
                </div>
                <p className="goal-status">🎉 Target achieved!</p>
              </div>

              <div className="goal-item">
                <div className="goal-header">
                  <span className="goal-name">Workout Sessions</span>
                  <span className="goal-percent">20/25</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '80%' }}></div>
                </div>
                <p className="goal-status">5 sessions left to complete!</p>
              </div>

              <div className="goal-item">
                <div className="goal-header">
                  <span className="goal-name">Total Workout Time</span>
                  <span className="goal-percent">1200/1500 min</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '80%' }}></div>
                </div>
                <p className="goal-status">Just 5 hours left!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Notifications and Quick Actions */}
        <div className="right-column">
          {/* Notifications */}
          <div className="notifications-card">
            <div className="card-header">
              <h2>Notifications</h2>
              <span className="badge red">
                {notifications.filter((n) => !n.read).length} New
              </span>
            </div>

            <div className="notifications-list">
              {notifications.map((notif) => (
                <div key={notif.id} className={`notification-item ${notif.type} ${notif.read ? 'read' : ''}`}>
                  <div className="notif-icon">
                    {notif.type === 'warning' && <Clock size={18} />}
                    {notif.type === 'success' && <CheckCircle size={18} />}
                    {notif.type === 'info' && <TrendingUp size={18} />}
                  </div>
                  <div className="notif-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <button className="mark-read" onClick={() => handleMarkRead(notif.id)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>

            <div className="action-buttons">
              <button className="action-btn primary">
                <Calendar size={18} />
                Book PT Session
                <ArrowRight size={16} />
              </button>
              <button className="action-btn">
                <TrendingUp size={18} />
                View Progress
                <ArrowRight size={16} />
              </button>
              <button className="action-btn">
                <Dumbbell size={18} />
                Workout Programs
                <ArrowRight size={16} />
              </button>
              <button className="action-btn">
                <Award size={18} />
                View Achievements
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Membership Info */}
          <div className="membership-info-card">
            <div className="card-header">
              <h2>Membership Info</h2>
            </div>

            {stats && (
              <div className="membership-details">
                <div className="detail-row">
                  <span>Plan Name</span>
                  <strong>{stats.currentMembership.planName}</strong>
                </div>
                <div className="detail-row">
                  <span>End Date</span>
                  <strong>{new Date(stats.currentMembership.endDate).toLocaleDateString()}</strong>
                </div>
                <div className="detail-row">
                  <span>Days Remaining</span>
                  <strong className="highlight">{stats.currentMembership.daysRemaining} days</strong>
                </div>

                <div className="membership-actions">
                  <button className="btn-renew">Renew Membership</button>
                  <button className="btn-freeze">Freeze Membership</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

