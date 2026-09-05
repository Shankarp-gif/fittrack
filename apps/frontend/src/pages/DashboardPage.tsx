import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../services/dashboardService'
import { DashboardOverview } from '../components/dashboard/DashboardOverview'
import { ActionCenter } from '../components/dashboard/ActionCenter'
import { Card } from '../components/common/Card'
import { showToast } from '../components/common/Toast'
import type { DashboardResponse } from '../types/dashboard'

export function DashboardPage() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(setDashboard)
      .catch((err) => {
        setError('Could not load dashboard data.')
        console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleStatClick = (stat: string) => {
    const routes: Record<string, string> = {
      members: '/members',
      active: '/members?status=active',
      new: '/members?status=new',
      expiring: '/memberships?status=expiring',
      expired: '/memberships?status=expired',
      attendance: '/attendance',
      payments: '/payments',
      pending: '/payments?status=pending',
      trainers: '/trainers',
      classes: '/classes',
      leads: '/leads',
      'add-member': '/members/new',
      payment: '/payments/new',
      membership: '/memberships/new',
      lead: '/leads/new',
      expense: '/expenses/new',
      class: '/classes/new',
      workout: '/workouts/new',
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
      <div className="p-6">
        <Card title="Error" highlight="danger">
          <p className="text-red-400">{error}</p>
        </Card>
      </div>
    )
  }

  // For now, show enhanced dashboard with mock stats
  const mockStats = {
    totalMembers: 145,
    activeMembers: 132,
    newMembersThisMonth: 12,
    expiringMemberships: 8,
    expiredMemberships: 5,
    todayAttendance: 48,
    todayPresent: 45,
    todayAbsent: 3,
    avgDailyAttendance: 42.5,
    pendingPayments: 15000,
    todayCollection: 8500,
    monthlyRevenue: 187500,
    monthlyExpenses: 45000,
    netRevenue: 142500,
    activeTrainers: 8,
    todaysClasses: 6,
    newLeads: 3,
    leadConversionRate: 32.5,
    renewalsThisMonth: 6,
  }

  const mockActions = [
    {
      id: '1',
      type: 'membership' as const,
      title: 'Membership Expiring Today',
      description: 'Raj Kumar - Premium Plan expiring in 2 hours',
      timestamp: '2 hours ago',
      urgent: true,
    },
    {
      id: '2',
      type: 'payment' as const,
      title: 'Pending Payment',
      description: 'Priya Sharma - ₹5,000 due',
      timestamp: '3 hours ago',
      urgent: false,
    },
    {
      id: '3',
      type: 'lead' as const,
      title: 'New Lead Inquiry',
      description: 'Amit Singh - Interested in 3-month plan',
      timestamp: 'Today',
      urgent: false,
    },
    {
      id: '4',
      type: 'class' as const,
      title: 'Yoga Class at 6 PM',
      description: 'Instructor: Neha Verma, Capacity: 25/25',
      timestamp: 'Later today',
      urgent: false,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome to Your Gym Dashboard</h1>
        <p className="text-[var(--muted)]">
          {dashboard?.userSummary?.fullName
            ? `Good to see you, ${dashboard.userSummary.fullName}!`
            : 'Manage your gym business from here'}
        </p>
      </div>

      <DashboardOverview
        stats={mockStats}
        loading={loading}
        onStatClick={handleStatClick}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActionCenter
            items={mockActions}
            loading={loading}
            onActionClick={(item) =>
              showToast({ message: `Clicked: ${item.title}`, type: 'info' })
            }
          />
        </div>

        <div className="space-y-6">
          <Card title="Monthly Summary">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">New Members</span>
                <span className="font-bold">+{mockStats.newMembersThisMonth}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--surface-2)] pt-3">
                <span className="text-[var(--muted)]">Renewals</span>
                <span className="font-bold">{mockStats.renewalsThisMonth}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--surface-2)] pt-3">
                <span className="text-[var(--muted)]">Total Classes</span>
                <span className="font-bold">
                  {mockStats.todaysClasses * 25}
                </span>
              </div>
              <div className="flex justify-between border-t border-[var(--surface-2)] pt-3">
                <span className="text-[var(--muted)]">Attendance Rate</span>
                <span className="font-bold text-green-400">
                  {((mockStats.todayPresent / (mockStats.todayPresent + mockStats.todayAbsent)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>

          <Card title="Top Performers">
            <div className="space-y-3">
              {[
                { name: 'Trainer: Vikram Singh', value: '32 sessions' },
                { name: 'Class: Power Yoga', value: '85% attendance' },
                { name: 'Plan: Premium Annual', value: '38 members' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm border-b border-[var(--surface-2)] pb-3 last:border-0"
                >
                  <span className="text-[var(--muted)]">{item.name}</span>
                  <span className="font-bold text-[var(--brand)]">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

