import { StatCard } from '../common/Card'
import { EmptyState, LoadingState } from '../common/StateComponents'
import './DashboardOverview.css'

interface DashboardStats {
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  expiringMemberships: number
  expiredMemberships: number
  todayAttendance: number
  todayPresent: number
  todayAbsent: number
  avgDailyAttendance: number
  pendingPayments: number
  todayCollection: number
  monthlyRevenue: number
  monthlyExpenses: number
  netRevenue: number
  activeTrainers: number
  todaysClasses: number
  newLeads: number
  leadConversionRate: number
  renewalsThisMonth: number
}

interface DashboardOverviewProps {
  stats?: DashboardStats
  loading?: boolean
  onStatClick?: (stat: string) => void
}

export function DashboardOverview({
  stats,
  loading,
  onStatClick,
}: DashboardOverviewProps) {
  if (loading) return <LoadingState />
  if (!stats)
    return (
      <EmptyState
        icon="📊"
        title="No data available"
        message="Dashboard data will appear here"
      />
    )

  return (
    <div className="dashboard-overview">
      {/* Member Statistics */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Member Overview</h2>
        <div className="dashboard-stats-grid dashboard-stats-grid-five">
          <StatCard
            label="Total Members"
            value={stats.totalMembers}
            icon="👥"
            onClick={() => onStatClick?.('members')}
          />
          <StatCard
            label="Active Members"
            value={stats.activeMembers}
            icon="✓"
            highlight="success"
            onClick={() => onStatClick?.('active')}
          />
          <StatCard
            label="New This Month"
            value={stats.newMembersThisMonth}
            icon="🆕"
            onClick={() => onStatClick?.('new')}
          />
          <StatCard
            label="Expiring Soon"
            value={stats.expiringMemberships}
            icon="⏳"
            highlight="warning"
            onClick={() => onStatClick?.('expiring')}
          />
          <StatCard
            label="Expired"
            value={stats.expiredMemberships}
            icon="❌"
            highlight="danger"
            onClick={() => onStatClick?.('expired')}
          />
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Today's Attendance</h2>
        <div className="dashboard-stats-grid dashboard-stats-grid-four">
          <StatCard
            label="Total Check-ins"
            value={stats.todayAttendance}
            icon="📋"
            onClick={() => onStatClick?.('attendance')}
          />
          <StatCard
            label="Present"
            value={stats.todayPresent}
            icon="🟢"
            highlight="success"
          />
          <StatCard
            label="Absent"
            value={stats.todayAbsent}
            icon="🔴"
            highlight="danger"
          />
          <StatCard
            label="Avg Daily Attendance"
            value={stats.avgDailyAttendance.toFixed(1)}
            icon="📈"
          />
        </div>
      </div>

      {/* Financial Statistics */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Financial Overview</h2>
        <div className="dashboard-stats-grid dashboard-stats-grid-five">
          <StatCard
            label="Today's Collection"
            value={`₹${stats.todayCollection.toLocaleString()}`}
            icon="💰"
            highlight="success"
            onClick={() => onStatClick?.('payments')}
          />
          <StatCard
            label="Pending Payments"
            value={`₹${stats.pendingPayments.toLocaleString()}`}
            icon="⏳"
            highlight="warning"
            onClick={() => onStatClick?.('pending')}
          />
          <StatCard
            label="Monthly Revenue"
            value={`₹${stats.monthlyRevenue.toLocaleString()}`}
            icon="📊"
          />
          <StatCard
            label="Monthly Expenses"
            value={`₹${stats.monthlyExpenses.toLocaleString()}`}
            icon="💸"
          />
          <StatCard
            label="Net Revenue"
            value={`₹${stats.netRevenue.toLocaleString()}`}
            icon="🎯"
            highlight={stats.netRevenue >= 0 ? 'success' : 'danger'}
          />
        </div>
      </div>

      {/* Staff & Operations */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Operations</h2>
        <div className="dashboard-stats-grid dashboard-stats-grid-four">
          <StatCard
            label="Active Trainers"
            value={stats.activeTrainers}
            icon="🏋️"
            onClick={() => onStatClick?.('trainers')}
          />
          <StatCard
            label="Today's Classes"
            value={stats.todaysClasses}
            icon="👫"
            onClick={() => onStatClick?.('classes')}
          />
          <StatCard
            label="New Leads"
            value={stats.newLeads}
            icon="🎯"
            onClick={() => onStatClick?.('leads')}
          />
          <StatCard
            label="Conversion Rate"
            value={`${stats.leadConversionRate.toFixed(1)}%`}
            icon="📈"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {[
            { icon: '➕', label: 'Add Member', action: 'add-member' },
            { icon: '💳', label: 'Record Payment', action: 'payment' },
            { icon: '📋', label: 'Mark Attendance', action: 'attendance' },
            { icon: '🎫', label: 'New Membership', action: 'membership' },
            { icon: '🎯', label: 'Add Lead', action: 'lead' },
            { icon: '💰', label: 'Add Expense', action: 'expense' },
            { icon: '👫', label: 'Create Class', action: 'class' },
            { icon: '🏋️', label: 'Assign Workout', action: 'workout' },
          ].map((action) => (
            <button
              key={action.action}
              onClick={() => onStatClick?.(action.action)}
              className="quick-action-button"
            >
              <span className="quick-action-icon">{action.icon}</span>
              <span className="quick-action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

