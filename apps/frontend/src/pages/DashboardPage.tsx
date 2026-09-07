import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../services/dashboardService'
import { notificationsService } from '../services/notificationsService'
import { DashboardOverview } from '../components/dashboard/DashboardOverview'
import { ActionCenter } from '../components/dashboard/ActionCenter'
import { Card } from '../components/common/Card'
import { showToast } from '../components/common/Toast'
import type { DashboardResponse } from '../types/dashboard'
import type { AppNotificationItem } from '../types/notifications'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

const inferNotificationType = (notification: AppNotificationItem) => {
  const text = `${notification.title} ${notification.message}`.toLowerCase()

  if (text.includes('membership') || text.includes('renew') || text.includes('expiry') || text.includes('expir')) {
    return 'membership' as const
  }
  if (text.includes('payment') || text.includes('fee') || text.includes('invoice')) {
    return 'payment' as const
  }
  if (text.includes('class') || text.includes('session')) {
    return 'class' as const
  }
  if (text.includes('lead')) {
    return 'lead' as const
  }

  return 'attendance' as const
}

const actionRouteByType = {
  membership: '/membership-plans',
  payment: '/fees',
  lead: '/members',
  attendance: '/attendance',
  class: '/plans',
} as const

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.allSettled([dashboardService.getDashboard(), notificationsService.list()])
      .then(([dashboardResult, notificationsResult]) => {
        if (dashboardResult.status === 'fulfilled') {
          setDashboard(dashboardResult.value)
        } else {
          setError('Could not load dashboard data.')
        }

        if (notificationsResult.status === 'fulfilled') {
          setNotifications(notificationsResult.value)
        } else {
          setNotifications([])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleStatClick = (stat: string) => {
    const routes: Record<string, string> = {
      members: '/members',
      active: '/members?status=ACTIVE',
      new: '/members',
      expiring: '/membership-plans',
      expired: '/membership-plans',
      attendance: '/attendance',
      payments: '/fees',
      pending: '/fees',
      trainers: '/user-management',
      classes: '/plans',
      leads: '/members',
    }

    if (routes[stat]) {
      navigate(routes[stat])
    } else {
      showToast({
        message: `Feature coming soon: ${stat}`,
        type: 'info',
      })
    }
  }

  if (error) {
    return (
      <div className="dashboard-error-wrap">
        <Card title="Error" highlight="danger">
          <p className="dashboard-error-text">{error}</p>
        </Card>
      </div>
    )
  }

  const derivedStats = {
    totalMembers: 0,
    activeMembers: 0,
    newMembersThisMonth: 0,
    expiringMemberships: 0,
    expiredMemberships: 0,
    todayAttendance: dashboard?.weeklyStats.weeklyWorkouts ?? 0,
    todayPresent: dashboard?.weeklyStats.weeklyWorkouts ?? 0,
    todayAbsent: 0,
    avgDailyAttendance: dashboard ? dashboard.weeklyStats.weeklyWorkouts / 7 : 0,
    pendingPayments: 0,
    todayCollection: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    netRevenue: 0,
    activeTrainers: user?.role === 'TRAINER' ? 1 : 0,
    todaysClasses: 0,
    newLeads: 0,
    leadConversionRate: 0,
    renewalsThisMonth: 0,
  }

  const actionItems = notifications.slice(0, 6).map((notification) => ({
    id: String(notification.id),
    type: inferNotificationType(notification),
    title: notification.title,
    description: notification.message,
    timestamp: new Date(notification.createdAt).toLocaleString(),
    urgent: !notification.read,
  }))

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <h1 className="dashboard-hero-title">Welcome to Your Gym Dashboard</h1>
        <p className="dashboard-hero-subtitle">
          {dashboard?.userSummary?.fullName
            ? `Good to see you, ${dashboard.userSummary.fullName}!`
            : 'Manage your gym business from here'}
        </p>
      </div>

      <DashboardOverview
        role={user?.role ?? 'ADMIN'}
        stats={derivedStats}
        loading={loading}
        onStatClick={handleStatClick}
        onQuickActionClick={(path) => navigate(path)}
      />

      <div className="dashboard-main-grid">
        <div className="dashboard-main-primary">
          <ActionCenter
            items={actionItems}
            loading={loading}
            onActionClick={async (item) => {
              const notificationId = Number(item.id)
              try {
                if (Number.isFinite(notificationId)) {
                  await notificationsService.markAsRead(notificationId)
                  setNotifications((current) =>
                    current.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
                  )
                }
                navigate(actionRouteByType[item.type])
              } catch {
                showToast({ message: 'Unable to update notification.', type: 'error' })
              }
            }}
          />
        </div>

        <div className="dashboard-main-secondary">
          <Card title="Monthly Summary">
            <div className="dashboard-summary-list">
              <div className="dashboard-summary-row">
                <span className="dashboard-summary-label">New Members</span>
                <span className="dashboard-summary-value">+{derivedStats.newMembersThisMonth}</span>
              </div>
              <div className="dashboard-summary-row dashboard-summary-row-separated">
                <span className="dashboard-summary-label">Renewals</span>
                <span className="dashboard-summary-value">{derivedStats.renewalsThisMonth}</span>
              </div>
              <div className="dashboard-summary-row dashboard-summary-row-separated">
                <span className="dashboard-summary-label">Total Classes</span>
                <span className="dashboard-summary-value">
                  {derivedStats.todaysClasses * 25}
                </span>
              </div>
              <div className="dashboard-summary-row dashboard-summary-row-separated">
                <span className="dashboard-summary-label">Attendance Rate</span>
                <span className="dashboard-summary-value dashboard-summary-value-positive">
                  {((derivedStats.todayPresent / Math.max(1, derivedStats.todayPresent + derivedStats.todayAbsent)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>

          <Card title="Top Performers">
            <div className="dashboard-top-performers-list">
              {[
                { name: 'Trainer: Vikram Singh', value: '32 sessions' },
                { name: 'Class: Power Yoga', value: '85% attendance' },
                { name: 'Plan: Premium Annual', value: '38 members' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="dashboard-top-performer-row"
                >
                  <span className="dashboard-top-performer-name">{item.name}</span>
                  <span className="dashboard-top-performer-value">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

