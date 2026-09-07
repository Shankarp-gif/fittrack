import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle,
  Calendar,
  TrendingUp,
  Dumbbell,
  Target,
  Clock,
  Award,
  ArrowRight,
  Building2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { notificationsService } from '../services/notificationsService'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { MembershipDetail } from '../types/fees'
import type { AppNotificationItem } from '../types/notifications'
import type { GymRole } from '../types/auth'
import { getDashboardQuickActionsForRole } from '../utils/dashboardActions'
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

interface MemberDashboardNotification extends AppNotificationItem {
  type: 'warning' | 'success' | 'info'
}

export function MemberDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [memberId, setMemberId] = useState<number | null>(null)
  const [currentMembership, setCurrentMembership] = useState<MembershipDetail | null>(null)
  const [processingMembershipAction, setProcessingMembershipAction] = useState(false)
  const [organizationName, setOrganizationName] = useState('Your Organization')
  const [notifications, setNotifications] = useState<MemberDashboardNotification[]>([])
  const [notificationsError, setNotificationsError] = useState('')

  useEffect(() => {
    if (user?.email) {
      fetchDashboardData()
    }
  }, [user?.email])

  const mapMembershipDetail = (membership: any): MembershipDetail => {
    const endDate = membership.endDate ? new Date(membership.endDate) : null
    const now = new Date()
    const msPerDay = 1000 * 60 * 60 * 24
    const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / msPerDay)) : 0

    return {
      id: membership.id,
      memberId: membership.memberId,
      memberName: membership.memberName,
      planId: membership.membershipPlanId,
      planName: membership.planName,
      startDate: membership.startDate,
      endDate: membership.endDate,
      status: membership.status,
      price: membership.price,
      discountAmount: membership.discountAmount,
      taxAmount: membership.taxAmount,
      totalAmount: membership.totalAmount,
      frozenUntil: membership.frozenUntil,
      freezeCount: membership.freezeCount || 0,
      daysRemaining,
    }
  }

  const resolveMemberId = async (): Promise<number | null> => {
    if (memberId) {
      return memberId
    }

    if (!user?.email) {
      return null
    }

    const response = await api.get('/api/memberships/my/member')
    const member = response.data?.data || response.data
    if (!member?.id) {
      return null
    }

    setMemberId(member.id)
    if (member.organizationName) {
      setOrganizationName(member.organizationName)
    } else if (member.organizationId) {
      setOrganizationName(`Organization #${member.organizationId}`)
    }
    return member.id
  }

  const fetchCurrentMembership = async () => {
    try {
      const response = await api.get('/api/memberships/my').catch(() => ({ data: null }))
      const payload = response.data?.data || response.data
      const membership = Array.isArray(payload) ? payload[0] : null
      const mappedMembership = membership ? mapMembershipDetail(membership) : null
      setCurrentMembership(mappedMembership)

      if (mappedMembership) {
        setStats((prev) => prev ? {
          ...prev,
          currentMembership: {
            planName: mappedMembership.planName,
            daysRemaining: mappedMembership.daysRemaining,
            endDate: mappedMembership.endDate,
          },
        } : prev)
      }
    } catch (error) {
      console.error('Error fetching current membership:', error)
      setCurrentMembership(null)
    }
  }

  const fetchMemberStats = async () => {
    try {
      const resolvedMemberId = await resolveMemberId()
      if (!resolvedMemberId) {
        setStats({
          currentMembership: { planName: 'No Active Membership', daysRemaining: 0, endDate: '' },
          thisMonthAttendance: { days: 0, percentage: 0 },
          thisMonthStats: { workoutsCompleted: 0, personalTrainingSessions: 0, totalMinutes: 0, caloriesBurned: 0 },
          nextFeePayment: { amount: 0, dueDate: '', status: 'PENDING' },
        })
        return
      }

      const response = await api.get(`/api/members/${resolvedMemberId}/stats`).catch(() => ({ data: null }))
      const stats: MemberStats = response.data?.data || {
        currentMembership: { planName: 'No Active Membership', daysRemaining: 0, endDate: '' },
        thisMonthAttendance: { days: 0, percentage: 0 },
        thisMonthStats: { workoutsCompleted: 0, personalTrainingSessions: 0, totalMinutes: 0, caloriesBurned: 0 },
        nextFeePayment: { amount: 0, dueDate: '', status: 'PENDING' },
      }
      setStats(stats)
    } catch (error) {
      console.error('Error fetching member stats:', error)
      setStats({
        currentMembership: { planName: 'No Active Membership', daysRemaining: 0, endDate: '' },
        thisMonthAttendance: { days: 0, percentage: 0 },
        thisMonthStats: { workoutsCompleted: 0, personalTrainingSessions: 0, totalMinutes: 0, caloriesBurned: 0 },
        nextFeePayment: { amount: 0, dueDate: '', status: 'PENDING' },
      })
    }
  }

  const fetchDashboardData = async () => {
    await Promise.all([fetchMemberStats(), fetchCurrentMembership(), fetchNotifications()])
  }

  const mapNotificationType = (notification: AppNotificationItem): MemberDashboardNotification['type'] => {
    const text = `${notification.title} ${notification.message}`.toLowerCase()

    if (text.includes('renew') || text.includes('membership') || text.includes('fee') || text.includes('payment') || text.includes('due')) {
      return 'warning'
    }

    if (text.includes('great') || text.includes('success') || text.includes('completed') || text.includes('achievement')) {
      return 'success'
    }

    return 'info'
  }

  const fetchNotifications = async () => {
    try {
      const items = await notificationsService.list()
      setNotifications(
        items.slice(0, 4).map((item) => ({
          ...item,
          type: mapNotificationType(item),
        })),
      )
      setNotificationsError('')
    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setNotificationsError('Unable to load notifications right now.')
    }
  }

  const safeDate = (value?: string): string => {
    if (!value) return '-'
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return '-'
    return parsed.toLocaleDateString()
  }

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id)
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
      setNotificationsError('Unable to update notification right now.')
    }
  }

  const handleRenewMembership = async () => {
    if (!currentMembership?.id) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'No Membership Found',
        message: 'There is no active membership available to renew.',
        type: 'error',
        duration: 3500,
      })
      return
    }

    setProcessingMembershipAction(true)
    try {
      await api.post(`/api/memberships/${currentMembership.id}/renew`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Renewed Successfully!',
        message: 'Your membership has been renewed.',
        type: 'success',
        duration: 4000,
      })
      await fetchDashboardData()
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Renewal Failed',
        message: error instanceof Error ? error.message : 'Failed to renew membership',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setProcessingMembershipAction(false)
    }
  }

  const handleFreezeMembership = async () => {
    if (!currentMembership?.id) return

    setProcessingMembershipAction(true)
    try {
      await api.post(`/api/memberships/${currentMembership.id}/freeze`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Frozen Successfully!',
        message: 'Your membership has been frozen.',
        type: 'success',
        duration: 4000,
      })
      await fetchDashboardData()
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Freeze Failed',
        message: error instanceof Error ? error.message : 'Failed to freeze membership',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setProcessingMembershipAction(false)
    }
  }

  const handleUnfreezeMembership = async () => {
    if (!currentMembership?.id) return

    setProcessingMembershipAction(true)
    try {
      await api.post(`/api/memberships/${currentMembership.id}/unfreeze`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Unfrozen Successfully!',
        message: 'Your membership has been unfrozen.',
        type: 'success',
        duration: 4000,
      })
      await fetchDashboardData()
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Unfreeze Failed',
        message: error instanceof Error ? error.message : 'Failed to unfreeze membership',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setProcessingMembershipAction(false)
    }
  }

  const canFreezeMembership = currentMembership?.status === 'ACTIVE' || currentMembership?.status === 'EXPIRING_SOON'
  const canUnfreezeMembership = currentMembership?.status === 'FROZEN'
  const quickActions = getDashboardQuickActionsForRole((user?.role ?? 'USER') as GymRole)

  return (
    <div className="member-dashboard role-dashboard-page">
      {/* Welcome Section */}
      <div className="welcome-section role-dashboard-header">
        <div>
          <h1 className="welcome-title role-dashboard-title">Welcome back, {user?.fullName}! 💪</h1>
          <p className="welcome-subtitle role-dashboard-subtitle">Track your fitness journey and stay motivated</p>
        </div>
        <div className="org-name-pill" title={organizationName}>
          <Building2 size={20} />
          {organizationName}
        </div>
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
              <p className="stat-sub">Due: {safeDate(stats.nextFeePayment.dueDate)}</p>
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
            <div className="performance-card role-dashboard-card">
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
          <div className="progress-card role-dashboard-card">
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
          <div className="notifications-card role-dashboard-card">
            <div className="card-header">
              <h2>Notifications</h2>
              <span className="badge red">
                {notifications.filter((n) => !n.read).length} New
              </span>
            </div>

            <div className="notifications-list">
              {notificationsError ? <p className="goal-status">{notificationsError}</p> : null}
              {!notificationsError && notifications.length === 0 ? (
                <div className="goal-item">
                  <p className="goal-status">No notifications yet.</p>
                </div>
              ) : null}
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
                    <p className="goal-status">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                  {!notif.read && (
                    <button
                      className="mark-read"
                      onClick={() => void handleMarkRead(notif.id)}
                      aria-label={`Mark notification "${notif.title}" as read`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="membership-actions">
              <button className="btn-freeze" onClick={() => navigate('/notifications')}>
                View All Notifications
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card role-dashboard-card">
            <div className="card-header">
              <h2>Quick Actions</h2>
            </div>

            <div className="action-buttons">
              {quickActions.map((action, index) => (
                <button
                  key={action.id}
                  className={`member-quick-action-btn ${index === 0 ? 'member-quick-action-btn-primary' : ''}`}
                  onClick={() => navigate(action.path)}
                >
                  <span>{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Membership Info */}
          <div className="membership-info-card role-dashboard-card">
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
                  <strong>{safeDate(stats.currentMembership.endDate)}</strong>
                </div>
                <div className="detail-row">
                  <span>Days Remaining</span>
                  <strong className="highlight">{stats.currentMembership.daysRemaining} days</strong>
                </div>
                {currentMembership && (
                  <>
                    <div className="detail-row">
                      <span>Status</span>
                      <strong>{currentMembership.status.replaceAll('_', ' ')}</strong>
                    </div>
                    {currentMembership.frozenUntil && currentMembership.status === 'FROZEN' && (
                      <div className="detail-row">
                        <span>Frozen Until</span>
                        <strong>{safeDate(currentMembership.frozenUntil)}</strong>
                      </div>
                    )}
                  </>
                )}

                <div className="membership-actions">
                  <button className="btn-renew" onClick={handleRenewMembership} disabled={processingMembershipAction || !currentMembership?.id}>
                    {processingMembershipAction ? 'Processing...' : 'Renew Membership'}
                  </button>
                  {canFreezeMembership && (
                    <button className="btn-freeze" onClick={handleFreezeMembership} disabled={processingMembershipAction}>
                      Freeze Membership
                    </button>
                  )}
                  {canUnfreezeMembership && (
                    <button className="btn-freeze" onClick={handleUnfreezeMembership} disabled={processingMembershipAction}>
                      Unfreeze Membership
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

