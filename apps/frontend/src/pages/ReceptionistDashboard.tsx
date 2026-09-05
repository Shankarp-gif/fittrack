import { useState, useEffect } from 'react'
import { Users, DollarSign, Clock, LogIn, UserPlus, CreditCard } from 'lucide-react'
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

export function ReceptionistDashboard() {
  const [stats, setStats] = useState<ReceptionistStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockStats: ReceptionistStats = {
        todayCheckIns: 42,
        totalMembers: 145,
        pendingFeesCount: 12,
        totalPendingFees: 58000,
        newRegistrationsToday: 3,
        newRegistrations: [
          { id: 1, name: 'Rohit Patel', time: '9:30 AM', plan: '30-Day Monthly' },
          { id: 2, name: 'Anjali Singh', time: '11:15 AM', plan: '90-Day Quarterly' },
          { id: 3, name: 'Deepak Kumar', time: '2:45 PM', plan: '30-Day Monthly' },
        ],
        recentCheckIns: [
          { id: 1, memberName: 'Raj Kumar', checkInTime: '6:15 AM', status: 'checked-in' },
          { id: 2, memberName: 'Priya Sharma', checkInTime: '6:45 AM', status: 'checked-in' },
          { id: 3, memberName: 'Amit Singh', checkInTime: '7:00 AM', status: 'checked-out' },
          { id: 4, memberName: 'Neha Verma', checkInTime: '7:30 AM', status: 'checked-in' },
        ],
        pendingFees: [
          { id: 1, memberName: 'Vishal Desai', amount: 5000, daysOverdue: 5 },
          { id: 2, memberName: 'Pooja Singh', amount: 3999, daysOverdue: 3 },
          { id: 3, memberName: 'Karan Patel', amount: 7500, daysOverdue: 8 },
        ],
      }
      setStats(mockStats)
      setLoading(false)
    }, 500)
  }, [])

  return (
    <div className="receptionist-dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reception Dashboard</h1>
          <p className="page-subtitle">Manage check-ins, registrations, and fee collection</p>
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
        <div className="registrations-section">
          <div className="section-header">
            <h2>New Registrations Today</h2>
            <button className="btn-add">+ Add Member</button>
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
                  <button className="reg-action">Complete</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Check-ins */}
        <div className="checkins-section">
          <div className="section-header">
            <h2>Recent Check-ins</h2>
            <button className="btn-checkin">Quick Check-in</button>
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
                  <button className="checkin-action">Update</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Fees */}
        <div className="fees-section">
          <div className="section-header">
            <h2>Pending Fee Collection</h2>
            <button className="btn-collect">Collect Fees</button>
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
                  <button className="fee-action">Collect</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="actions-grid">
          <button className="action-card">
            <UserPlus size={24} />
            <span>Register Member</span>
          </button>
          <button className="action-card">
            <LogIn size={24} />
            <span>Check-in Member</span>
          </button>
          <button className="action-card">
            <CreditCard size={24} />
            <span>Collect Payment</span>
          </button>
          <button className="action-card">
            <DollarSign size={24} />
            <span>Fee Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}

