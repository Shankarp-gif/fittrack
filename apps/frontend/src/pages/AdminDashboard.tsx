import { useState, useEffect } from 'react'
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

export function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch stats from API
      const statsResponse = await api.get('/api/admin/stats').catch(() => ({ data: null }))
      const stats: AdminStats = statsResponse.data || {
        totalMembers: 0,
        activeMembers: 0,
        expiredMembers: 0,
        totalRevenue: 0,
        pendingCollections: 0,
        todayCheckIns: 0,
        weeklyActiveMembers: 0,
        monthlyGrowth: 0,
      }

      // Fetch recent activities from API
      const activitiesResponse = await api.get('/api/admin/recent-activities').catch(() => ({ data: [] }))
      const activities: RecentActivity[] = activitiesResponse.data || []

      setStats(stats)
      setRecentActivities(activities)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Show default empty state
      setStats({
        totalMembers: 0,
        activeMembers: 0,
        expiredMembers: 0,
        totalRevenue: 0,
        pendingCollections: 0,
        todayCheckIns: 0,
        weeklyActiveMembers: 0,
        monthlyGrowth: 0,
      })
      setRecentActivities([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Generating Report',
        message: 'Your report is being generated. Please wait...',
        type: 'info',
        duration: 2000,
      })
      // TODO: Implement actual report export functionality
      // This would typically call an API to generate and download a report
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
    // Navigate to a full activities page if it exists, or show a modal
    navigate('/reports')
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

