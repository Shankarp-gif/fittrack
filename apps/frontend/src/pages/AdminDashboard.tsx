import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { api } from '../services/api'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
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

const DEFAULT_ADMIN_STATS: AdminStats = {
  totalMembers: 0,
  activeMembers: 0,
  expiredMembers: 0,
  totalRevenue: 0,
  pendingCollections: 0,
  todayCheckIns: 0,
  weeklyActiveMembers: 0,
  monthlyGrowth: 0,
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch stats from API
      const statsResponse = await api.get('/api/admin/stats').catch(() => ({ data: null }))
      const rawStats = statsResponse.data?.data || statsResponse.data || {}
      const stats: AdminStats = {
        totalMembers: Number(rawStats.totalMembers) || 0,
        activeMembers: Number(rawStats.activeMembers) || 0,
        expiredMembers: Number(rawStats.expiredMembers) || 0,
        totalRevenue: Number(rawStats.totalRevenue) || 0,
        pendingCollections: Number(rawStats.pendingCollections) || 0,
        todayCheckIns: Number(rawStats.todayCheckIns) || 0,
        weeklyActiveMembers: Number(rawStats.weeklyActiveMembers) || 0,
        monthlyGrowth: Number(rawStats.monthlyGrowth) || 0,
      }

      // Fetch recent activities from API
      const activitiesResponse = await api.get('/api/admin/recent-activities').catch(() => ({ data: [] }))
      const rawActivities = activitiesResponse.data?.data || activitiesResponse.data || []
      const activities: RecentActivity[] = Array.isArray(rawActivities)
        ? rawActivities.map((activity: any) => ({
          id: Number(activity.id) || 0,
          memberName: String(activity.memberName || activity.name || 'Member'),
          action: String(activity.action || activity.description || ''),
          timestamp: String(activity.timestamp || activity.createdAt || ''),
          type: activity.type === 'enrollment' || activity.type === 'payment' || activity.type === 'attendance' || activity.type === 'alert'
            ? activity.type
            : 'attendance',
        }))
        : []

      setStats(stats)
      setRecentActivities(activities)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Show default empty state
      setStats(DEFAULT_ADMIN_STATS)
      setRecentActivities([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDashboardData()
  }, [fetchDashboardData])

  const handleExportReport = async () => {
    try {
      const now = new Date()
      const safeDate = now.toISOString().slice(0, 10)
      const csvLines = [
        'Section,Metric,Value',
        `Stats,Total Members,${stats?.totalMembers ?? 0}`,
        `Stats,Active Members,${stats?.activeMembers ?? 0}`,
        `Stats,Expired Members,${stats?.expiredMembers ?? 0}`,
        `Stats,Total Revenue,${stats?.totalRevenue ?? 0}`,
        `Stats,Pending Collections,${stats?.pendingCollections ?? 0}`,
        `Stats,Today's Check-ins,${stats?.todayCheckIns ?? 0}`,
        `Stats,Weekly Active Members,${stats?.weeklyActiveMembers ?? 0}`,
        `Stats,Monthly Growth,${stats?.monthlyGrowth ?? 0}`,
        '',
        'Recent Activity,Member,Action,Timestamp,Type',
        ...recentActivities.map((activity) =>
          [
            'Activity',
            `"${activity.memberName.replace(/"/g, '""')}"`,
            `"${activity.action.replace(/"/g, '""')}"`,
            `"${activity.timestamp.replace(/"/g, '""')}"`,
            activity.type,
          ].join(',')
        ),
      ]

      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-dashboard-report-${safeDate}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Report Exported',
        message: 'Dashboard report downloaded as CSV.',
        type: 'success',
        duration: 2200,
      })
    } catch (error) {
      console.error('Error exporting report:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to export report',
        type: 'error',
        duration: 3000,
      })
    }
  }

  const handleAddMember = () => {
    navigate('/members/new')
  }

  const handleCollectFees = () => {
    navigate('/fees')
  }

  const handleCreatePlan = () => {
    navigate('/membership-plans')
  }

  const handleViewAnalytics = () => {
    navigate('/reports')
  }

  const handleViewAllActivities = () => {
    navigate('/notifications')
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
    <div className="admin-dashboard role-dashboard-page">
      {/* Header */}
      <div className="dashboard-header role-dashboard-header">
        <div>
          <h1 className="dashboard-title role-dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle role-dashboard-subtitle">Manage your gym operations</p>
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
              <span className="kpi-label">Active: {stats?.activeMembers ?? 0}</span>
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
              ₹{(stats?.totalRevenue ?? 0).toLocaleString()}
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
              ₹{(stats?.pendingCollections ?? 0).toLocaleString()}
              <span className="kpi-label">{stats?.expiredMembers ?? 0} Members</span>
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
              {stats?.monthlyGrowth ?? 0}%
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
              {stats?.todayCheckIns ?? 0}
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
              {stats?.weeklyActiveMembers ?? 0}
              <span className="kpi-label">Members this week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activities Section */}
      <div className="dashboard-content">
        {/* Recent Activity */}
        <div className="activity-section role-dashboard-card">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button onClick={handleViewAllActivities} className="view-all" style={{ cursor: 'pointer' }}>
              View All
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading activities...</div>
          ) : recentActivities.length === 0 ? (
            <div className="empty-state">
              <p>No recent activities</p>
            </div>
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
        <div className="quick-actions-section role-dashboard-card">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>

          <div className="actions-grid role-dashboard-actions-grid">
            <button
              className="action-card role-dashboard-action-card"
              onClick={handleAddMember}
              title="Add a new member to your gym"
            >
              <Users size={24} />
              <span>Add New Member</span>
            </button>
            <button
              className="action-card role-dashboard-action-card"
              onClick={handleCollectFees}
              title="Collect fees from members"
            >
              <DollarSign size={24} />
              <span>Collect Fees</span>
            </button>
            <button
              className="action-card role-dashboard-action-card"
              onClick={handleCreatePlan}
              title="Create a new membership plan"
            >
              <Calendar size={24} />
              <span>Create Plan</span>
            </button>
            <button
              className="action-card role-dashboard-action-card"
              onClick={handleViewAnalytics}
              title="View detailed analytics and reports"
            >
              <BarChart3 size={24} />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      <div className="alerts-section role-dashboard-card">
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

