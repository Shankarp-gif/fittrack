import { useState, useEffect } from 'react'
import {
  Users,
  TrendingUp,
  DollarSign,
  AlertCircle,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  Download,
} from 'lucide-react'
import '../styles/AdminDashboard.css'

interface AdminStats {
  totalMembers: number
  activeMembers: number
  expiredMembers: number
  totalRevenue: number
  pendingCollections: number
  todayCheckIns: number
  weeklyActiveMembers: number
  monthlyGrowth: number
}

interface RecentActivity {
  id: number
  memberName: string
  action: string
  timestamp: string
  type: 'enrollment' | 'payment' | 'attendance' | 'alert'
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockStats: AdminStats = {
        totalMembers: 250,
        activeMembers: 220,
        expiredMembers: 30,
        totalRevenue: 750000,
        pendingCollections: 125000,
        todayCheckIns: 45,
        weeklyActiveMembers: 180,
        monthlyGrowth: 12.5,
      }

      const mockActivities: RecentActivity[] = [
        {
          id: 1,
          memberName: 'John Doe',
          action: 'New enrollment in 30-day plan',
          timestamp: '2 hours ago',
          type: 'enrollment',
        },
        {
          id: 2,
          memberName: 'Jane Smith',
          action: 'Fee payment of ₹3,999',
          timestamp: '4 hours ago',
          type: 'payment',
        },
        {
          id: 3,
          memberName: 'Mike Johnson',
          action: 'Membership expired',
          timestamp: '6 hours ago',
          type: 'alert',
        },
        {
          id: 4,
          memberName: 'Sarah Williams',
          action: 'Checked in at gym',
          timestamp: '10 mins ago',
          type: 'attendance',
        },
      ]

      setStats(mockStats)
      setRecentActivities(mockActivities)
      setLoading(false)
    }, 500)
  }, [])

  const handleExportReport = () => {
    alert('Exporting admin report...')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment':
        return <Users size={18} />
      case 'payment':
        return <DollarSign size={18} />
      case 'attendance':
        return <CheckCircle size={18} />
      case 'alert':
        return <AlertCircle size={18} />
      default:
        return <Clock size={18} />
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Manage your gym operations</p>
        </div>
        <button className="export-btn" onClick={handleExportReport}>
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <div className="kpi-card primary">
          <div className="kpi-icon">
            <Users size={28} />
          </div>
          <div className="kpi-content">
            <h3>Total Members</h3>
            <div className="kpi-value">
              {stats?.totalMembers ?? 0}
              <span className="kpi-label">Active: {stats?.activeMembers}</span>
            </div>
          </div>
        </div>

        <div className="kpi-card success">
          <div className="kpi-icon">
            <TrendingUp size={28} />
          </div>
          <div className="kpi-content">
            <h3>Total Revenue</h3>
            <div className="kpi-value">
              ₹{stats?.totalRevenue.toLocaleString()}
              <span className="kpi-label">This Month</span>
            </div>
          </div>
        </div>

        <div className="kpi-card warning">
          <div className="kpi-icon">
            <Clock size={28} />
          </div>
          <div className="kpi-content">
            <h3>Pending Collections</h3>
            <div className="kpi-value">
              ₹{stats?.pendingCollections.toLocaleString()}
              <span className="kpi-label">{stats?.expiredMembers} Members</span>
            </div>
          </div>
        </div>

        <div className="kpi-card info">
          <div className="kpi-icon">
            <BarChart3 size={28} />
          </div>
          <div className="kpi-content">
            <h3>Monthly Growth</h3>
            <div className="kpi-value">
              {stats?.monthlyGrowth}%
              <span className="kpi-label">New members this month</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon attendance">
            <CheckCircle size={28} />
          </div>
          <div className="kpi-content">
            <h3>Today's Check-ins</h3>
            <div className="kpi-value">
              {stats?.todayCheckIns}
              <span className="kpi-label">Active members today</span>
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Calendar size={28} />
          </div>
          <div className="kpi-content">
            <h3>Weekly Active</h3>
            <div className="kpi-value">
              {stats?.weeklyActiveMembers}
              <span className="kpi-label">Members this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activities Section */}
      <div className="dashboard-content">
        {/* Recent Activity */}
        <div className="activity-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <a href="#" className="view-all">View All</a>
          </div>

          {loading ? (
            <div className="loading-state">Loading activities...</div>
          ) : (
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className={`activity-item ${activity.type}`}>
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.memberName}</h4>
                    <p>{activity.action}</p>
                  </div>
                  <div className="activity-time">{activity.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="actions-grid">
            <button className="action-card">
              <Users size={24} />
              <span>Add New Member</span>
            </button>
            <button className="action-card">
              <DollarSign size={24} />
              <span>Collect Fees</span>
            </button>
            <button className="action-card">
              <Calendar size={24} />
              <span>Create Plan</span>
            </button>
            <button className="action-card">
              <BarChart3 size={24} />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      <div className="alerts-section">
        <div className="section-header">
          <h2>Important Alerts</h2>
        </div>

        <div className="alerts-list">
          <div className="alert-item critical">
            <AlertCircle size={20} />
            <div className="alert-content">
              <h4>High Pending Collections</h4>
              <p>₹125,000 pending fees from 30 members. Take action today!</p>
            </div>
          </div>

          <div className="alert-item warning">
            <AlertCircle size={20} />
            <div className="alert-content">
              <h4>Members Expiring Soon</h4>
              <p>15 members will have expired memberships in the next 7 days</p>
            </div>
          </div>

          <div className="alert-item info">
            <CheckCircle size={20} />
            <div className="alert-content">
              <h4>Monthly Target Achieved</h4>
              <p>You've achieved 92% of this month's revenue target!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

