import { useEffect, useState } from 'react'
import { Users, DollarSign, BarChart3, Download, RefreshCw } from 'lucide-react'
import { reportsService } from '../services/reportsService'
import type { MemberReport, FinancialReport, AttendanceReport } from '../types/reports'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import '../styles/ReportsPage.css'

export function ReportsPage() {
  const [memberReport, setMemberReport] = useState<MemberReport | null>(null)
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null)
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const reports = await reportsService.getReports()
      setMemberReport(reports.memberReport)
      setFinancialReport(reports.financialReport)
      setAttendanceReport(reports.attendanceReport)
    } catch (error) {
      console.error('Error fetching reports:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load reports. Please try again.',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(true)
    try {
      const blob = await reportsService.exportReport(format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reports.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Success',
        message: `Report exported as ${format.toUpperCase()}`,
        type: 'success',
        duration: 2000,
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
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="reports-page role-dashboard-page">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="reports-page role-dashboard-page">
      <div className="page-header role-dashboard-header reports-header-card role-dashboard-card">
        <div>
          <h1 className="page-title role-dashboard-title">Reports & Analytics</h1>
          <p className="page-subtitle role-dashboard-subtitle">
            View comprehensive reports on members, finances, and attendance
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchReports}
            className="action-btn refresh-btn"
            title="Refresh Reports"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <div className="export-dropdown">
            <button className="export-btn">
              <Download size={20} />
              Export
            </button>
            <div className="dropdown-menu">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting}
                className="dropdown-item"
              >
                Export as PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={exporting}
                className="dropdown-item"
              >
                Export as Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Member Report Section */}
      <div className="reports-section">
        <h2 className="section-title">
          <Users size={24} />
          Member Statistics
        </h2>
        <div className="report-cards-grid">
          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Total Members</h3>
              <div className="icon-badge member-badge">
                <Users size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{memberReport?.totalMembers ?? 0}</p>
              <p className="stat-label">All Time</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Active Members</h3>
              <div className="icon-badge active-badge">
                <Users size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{memberReport?.activeMembers ?? 0}</p>
              <p className="stat-label">Currently Active</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Expiring Soon</h3>
              <div className="icon-badge expiring-badge">
                <Users size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{memberReport?.expiringSoonMembers ?? 0}</p>
              <p className="stat-label">Expiring Soon</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Expired</h3>
              <div className="icon-badge expired-badge">
                <Users size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{memberReport?.expiredMembers ?? 0}</p>
              <p className="stat-label">Expired Membership</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>New This Month</h3>
              <div className="icon-badge new-badge">
                <Users size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{memberReport?.newMembersThisMonth ?? 0}</p>
              <p className="stat-label">New Registrations</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Growth Rate</h3>
              <div className="icon-badge growth-badge">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{formatPercentage(memberReport?.memberGrowthPercentage ?? 0)}</p>
              <p className="stat-label">Month over Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Report Section */}
      <div className="reports-section">
        <h2 className="section-title">
          <DollarSign size={24} />
          Financial Overview
        </h2>
        <div className="report-cards-grid">
          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Total Revenue</h3>
              <div className="icon-badge revenue-badge">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{formatCurrency(financialReport?.totalRevenue ?? 0)}</p>
              <p className="stat-label">All Time Revenue</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>This Month</h3>
              <div className="icon-badge month-badge">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{formatCurrency(financialReport?.thisMonthRevenue ?? 0)}</p>
              <p className="stat-label">Current Month Revenue</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Pending Payments</h3>
              <div className="icon-badge pending-badge">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{formatCurrency(financialReport?.pendingPayments ?? 0)}</p>
              <p className="stat-label">Awaiting Payment</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Overdue Payments</h3>
              <div className="icon-badge overdue-badge">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{formatCurrency(financialReport?.overduePayments ?? 0)}</p>
              <p className="stat-label">Overdue Amount</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Avg Membership Value</h3>
              <div className="icon-badge avg-badge">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{formatCurrency(financialReport?.averageMembershipValue ?? 0)}</p>
              <p className="stat-label">Per Member</p>
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        {financialReport?.revenueTrend && financialReport.revenueTrend.length > 0 && (
          <div className="chart-container role-dashboard-card">
            <h3>Revenue Trend</h3>
            <div className="simple-chart">
              {financialReport.revenueTrend.map((trend) => (
                <div key={trend.month} className="chart-item">
                  <div className="chart-label">{trend.month}</div>
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${(trend.amount / Math.max(...financialReport.revenueTrend.map((t) => t.amount))) * 200}px`,
                      }}
                    />
                  </div>
                  <div className="chart-value">{formatCurrency(trend.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attendance Report Section */}
      <div className="reports-section">
        <h2 className="section-title">
          <BarChart3 size={24} />
          Attendance Analytics
        </h2>
        <div className="report-cards-grid">
          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Avg Attendance Rate</h3>
              <div className="icon-badge attendance-badge">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{formatPercentage(attendanceReport?.averageAttendanceRate ?? 0)}</p>
              <p className="stat-label">Overall Rate</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>This Month</h3>
              <div className="icon-badge month-attendance-badge">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{attendanceReport?.thisMonthAttendance ?? 0}</p>
              <p className="stat-label">Total Check-ins</p>
            </div>
          </div>

          <div className="report-card role-dashboard-card">
            <div className="card-header">
              <h3>Daily Average</h3>
              <div className="icon-badge daily-badge">
                <BarChart3 size={20} />
              </div>
            </div>
            <div className="card-body">
              <p className="stat-value">{attendanceReport?.dailyAverage ?? 0}</p>
              <p className="stat-label">Members Per Day</p>
            </div>
          </div>
        </div>

        {/* Peak Hours Chart */}
        {attendanceReport?.peakHours && attendanceReport.peakHours.length > 0 && (
          <div className="chart-container role-dashboard-card">
            <h3>Peak Hours</h3>
            <div className="peak-hours-list">
              {attendanceReport.peakHours.map((hour) => (
                <div key={hour.hour} className="peak-hour-item">
                  <span className="hour-label">{hour.hour}</span>
                  <div className="hour-bar-container">
                    <div
                      className="hour-bar"
                      style={{
                        width: `${(hour.count / Math.max(...attendanceReport.peakHours.map((h) => h.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="hour-value">{hour.count} members</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

