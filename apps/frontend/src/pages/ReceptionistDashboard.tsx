import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, DollarSign, Clock, LogIn, UserPlus, CreditCard } from 'lucide-react'
import { api } from '../services/api'
import '../styles/ReceptionistDashboard.css'

interface ReceptionistStats {
  todayCheckIns: number
  totalMembers: number
  pendingFeesCount: number
  totalPendingFees: number
  newRegistrationsToday: number
  newRegistrations: Array<{
    id: number
    name: string
    time: string
    plan: string
  }>
  recentCheckIns: Array<{
    id: number
    memberName: string
    checkInTime: string
    status: 'checked-in' | 'checked-out'
  }>
  pendingFees: Array<{
    id: number
    memberName: string
    amount: number
    daysOverdue: number
  }>
}

export function GymOperationsDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<ReceptionistStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReceptionistStats()
  }, [])

  const fetchReceptionistStats = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/receptionist/stats').catch(() => ({ data: null }))
      const stats: ReceptionistStats = response.data || {
        todayCheckIns: 0,
        totalMembers: 0,
        pendingFeesCount: 0,
        totalPendingFees: 0,
        newRegistrationsToday: 0,
        newRegistrations: [],
        recentCheckIns: [],
        pendingFees: [],
      }
      setStats(stats)
    } catch (error) {
      console.error('Error fetching receptionist stats:', error)
      setStats({
        todayCheckIns: 0,
        totalMembers: 0,
        pendingFeesCount: 0,
        totalPendingFees: 0,
        newRegistrationsToday: 0,
        newRegistrations: [],
        recentCheckIns: [],
        pendingFees: [],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="receptionist-dashboard role-dashboard-page">
      {/* Page Header */}
      <div className="page-header role-dashboard-header">
        <div>
          <h1 className="page-title role-dashboard-title">Gym Maintenance Manager Dashboard</h1>
          <p className="page-subtitle role-dashboard-subtitle">Manage check-ins, registrations, and fee collection</p>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-icon">
              <LogIn size={28} />
            </div>
            <div className="metric-content">
              <h3>Today's Check-ins</h3>
              <p className="metric-value">{stats.todayCheckIns}</p>
              <p className="metric-label">Members checked in</p>
            </div>
          </div>

          <div className="metric-card active">
            <div className="metric-icon">
              <Users size={28} />
            </div>
            <div className="metric-content">
              <h3>Total Members</h3>
              <p className="metric-value">{stats.totalMembers}</p>
              <p className="metric-label">Active members</p>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon">
              <CreditCard size={28} />
            </div>
            <div className="metric-content">
              <h3>Pending Fees</h3>
              <p className="metric-value">₹{stats.totalPendingFees.toLocaleString()}</p>
              <p className="metric-label">{stats.pendingFeesCount} members</p>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-icon">
              <UserPlus size={28} />
            </div>
            <div className="metric-content">
              <h3>New Registrations</h3>
              <p className="metric-value">{stats.newRegistrationsToday}</p>
              <p className="metric-label">Today</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="receptionist-content-grid">
        {/* New Registrations */}
        <div className="registrations-section role-dashboard-card">
          <div className="section-header">
            <h2>New Registrations Today</h2>
            <button className="btn-add" onClick={() => navigate('/members/new')}>+ Add Member</button>
          </div>

          {loading ? (
            <div className="loading">Loading registrations...</div>
          ) : (
            <div className="registrations-list">
              {stats?.newRegistrations.map((reg) => (
                <div key={reg.id} className="registration-card">
                  <div className="reg-time">
                    <Clock size={18} />
                    <span>{reg.time}</span>
                  </div>
                  <div className="reg-info">
                    <h4>{reg.name}</h4>
                    <p>{reg.plan}</p>
                  </div>
                  <button className="reg-action" onClick={() => navigate('/membership-plans')}>Complete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Check-ins */}
        <div className="checkins-section role-dashboard-card">
          <div className="section-header">
            <h2>Recent Check-ins</h2>
            <button className="btn-checkin" onClick={() => navigate('/attendance')}>Quick Check-in</button>
          </div>

          {loading ? (
            <div className="loading">Loading check-ins...</div>
          ) : (
            <div className="checkins-list">
              {stats?.recentCheckIns.map((checkin) => (
                <div key={checkin.id} className={`checkin-card ${checkin.status}`}>
                  <div className="checkin-status">
                    <div className={`status-dot ${checkin.status}`}></div>
                    <span className="status-text">{checkin.status === 'checked-in' ? 'In' : 'Out'}</span>
                  </div>
                  <div className="checkin-info">
                    <h4>{checkin.memberName}</h4>
                    <p>{checkin.checkInTime}</p>
                  </div>
                  <button className="checkin-action" onClick={() => navigate('/attendance')}>Update</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Fees */}
        <div className="fees-section role-dashboard-card">
          <div className="section-header">
            <h2>Pending Fee Collection</h2>
            <button className="btn-collect" onClick={() => navigate('/fees')}>Collect Fees</button>
          </div>

          {loading ? (
            <div className="loading">Loading pending fees...</div>
          ) : (
            <div className="fees-list">
              {stats?.pendingFees.map((fee) => (
                <div key={fee.id} className="fee-card overdue">
                  <div className="fee-amount">
                    <DollarSign size={20} />
                    <span className="amount">₹{fee.amount}</span>
                  </div>
                  <div className="fee-info">
                    <h4>{fee.memberName}</h4>
                    <p className="overdue-days">{fee.daysOverdue} days overdue</p>
                  </div>
                  <button className="fee-action" onClick={() => navigate('/fees')}>Collect</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section role-dashboard-card">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="actions-grid role-dashboard-actions-grid">
          <button className="action-card role-dashboard-action-card" onClick={() => navigate('/members/new')}>
            <UserPlus size={24} />
            <span>Register Member</span>
          </button>
          <button className="action-card role-dashboard-action-card" onClick={() => navigate('/attendance')}>
            <LogIn size={24} />
            <span>Check-in Member</span>
          </button>
          <button className="action-card role-dashboard-action-card" onClick={() => navigate('/fees')}>
            <CreditCard size={24} />
            <span>Collect Payment</span>
          </button>
          <button className="action-card role-dashboard-action-card" onClick={() => navigate('/membership-plans')}>
            <DollarSign size={24} />
            <span>Membership Plans</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Backward-compatible export for any remaining imports.
export const ReceptionistDashboard = GymOperationsDashboard

