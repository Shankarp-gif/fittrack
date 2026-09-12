import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, GitBranch, ShieldAlert, UserCog, Building2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import {
  hierarchyAuditService,
  type HierarchyAuditIssue,
  type HierarchyAuditSnapshot,
} from '../services/hierarchyAuditService'
import '../styles/HierarchyAuditPage.css'

const ISSUE_LABELS: Record<string, string> = {
  MISSING_ORGANIZATION: 'Missing Organization',
  MISSING_BRANCH: 'Missing Branch',
  BRANCH_ORG_MISMATCH: 'Branch / Organization Mismatch',
  MISSING_SUPERVISOR: 'Missing Supervisor',
  INVALID_SUPERVISOR_ROLE: 'Invalid Supervisor Role',
  SUPERVISOR_ORG_MISMATCH: 'Supervisor Org Mismatch',
  INACTIVE_SUPERVISOR: 'Inactive Supervisor',
  HIERARCHY_CYCLE: 'Hierarchy Cycle',
}

export function HierarchyAuditPage() {
  const navigate = useNavigate()
  const [snapshot, setSnapshot] = useState<HierarchyAuditSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all')

  useEffect(() => {
    void loadAudit()
  }, [])

  const loadAudit = async () => {
    try {
      setLoading(true)
      const data = await hierarchyAuditService.getSnapshot()
      setSnapshot(data)
    } catch (error: any) {
      console.error('Failed to load hierarchy audit', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Audit Load Failed',
        message: error?.response?.data?.message || 'Unable to load hierarchy audit data.',
        type: 'error',
        duration: 4000,
      })
      setSnapshot(null)
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues = useMemo(() => {
    const issues = snapshot?.issues || []
    return issues.filter((issue) => {
      const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter
      const haystack = [
        issue.fullName,
        issue.email,
        issue.organizationName,
        issue.supervisorName,
        issue.issueCode,
        issue.message,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = haystack.includes(searchTerm.toLowerCase())
      return matchesSeverity && matchesSearch
    })
  }, [searchTerm, severityFilter, snapshot?.issues])

  const summaryCards = useMemo(() => {
    const summary = snapshot?.summary
    if (!summary) {
      return []
    }

    return [
      {
        label: 'Users Audited',
        value: summary.totalUsers,
        icon: <UserCog size={18} />,
      },
      {
        label: 'Missing Org/Branch',
        value: summary.usersWithoutOrganization + summary.usersWithoutBranch + summary.usersWithBranchMismatch,
        icon: <Building2 size={18} />,
      },
      {
        label: 'Supervisor Issues',
        value: summary.usersWithoutSupervisor + summary.usersWithInvalidSupervisor + summary.usersWithInactiveSupervisor,
        icon: <ShieldAlert size={18} />,
      },
      {
        label: 'Hierarchy Cycles',
        value: summary.usersWithHierarchyCycle,
        icon: <GitBranch size={18} />,
      },
    ]
  }, [snapshot?.summary])

  const openFixTarget = (issue: HierarchyAuditIssue) => {
    if (issue.issueCode === 'MISSING_SUPERVISOR' || issue.issueCode.includes('SUPERVISOR') || issue.issueCode === 'HIERARCHY_CYCLE') {
      navigate(`/hierarchy?userId=${issue.userId}`)
      return
    }
    navigate(`/user-management?userId=${issue.userId}`)
  }

  return (
    <div className="hierarchy-audit-page">
      <section className="audit-header panel">
        <div>
          <h1>
            <AlertTriangle size={28} />
            Organization Hierarchy Audit
          </h1>
          <p className="muted">
            Review users with missing organization, branch, or supervisor relationships and jump straight to a fix path.
          </p>
        </div>
        <button type="button" className="primary-btn" onClick={() => void loadAudit()} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Audit'}
        </button>
      </section>

      {snapshot?.summary ? (
        <section className="panel audit-summary-panel">
          <div className="audit-meta">
            <span><strong>Scope:</strong> {snapshot.summary.scope === 'GLOBAL' ? 'All Organizations' : snapshot.summary.organizationName || 'Organization'}</span>
            <span><strong>Generated:</strong> {new Date(snapshot.summary.generatedAt).toLocaleString()}</span>
            <span><strong>Organizations:</strong> {snapshot.summary.totalOrganizations}</span>
          </div>
          <div className="audit-summary-grid">
            {summaryCards.map((card) => (
              <article key={card.label} className="audit-summary-card">
                <div className="audit-card-icon">{card.icon}</div>
                <div>
                  <h3>{card.value}</h3>
                  <p>{card.label}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel audit-filters-panel">
        <input
          type="text"
          className="filter-input"
          placeholder="Search user, org, supervisor, or issue..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select
          className="filter-select"
          value={severityFilter}
          onChange={(event) => setSeverityFilter(event.target.value as 'all' | 'critical' | 'warning')}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="warning">Warning</option>
        </select>
        <span className="filter-result">{filteredIssues.length} issues</span>
      </section>

      <section className="panel audit-issues-panel">
        <div className="section-title-row">
          <h2>Detected Issues</h2>
        </div>

        {loading ? (
          <p className="muted">Loading audit data...</p>
        ) : filteredIssues.length === 0 ? (
          <div className="audit-empty-state">
            <ShieldAlert size={48} />
            <h3>No hierarchy issues found</h3>
            <p>Your organization hierarchy looks clean for the current scope.</p>
          </div>
        ) : (
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Organization</th>
                  <th>Branch</th>
                  <th>Supervisor</th>
                  <th>Issue</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={`${issue.userId}-${issue.issueCode}`}>
                    <td>
                      <div className="audit-user-cell">
                        <strong>{issue.fullName}</strong>
                        <span>{issue.email}</span>
                      </div>
                    </td>
                    <td>{issue.role === 'USER' ? 'Member' : issue.role}</td>
                    <td>{issue.organizationName || 'Unassigned'}</td>
                    <td>{issue.branchName || 'Unassigned'}</td>
                    <td>{issue.supervisorName || 'Unassigned'}</td>
                    <td>
                      <div className="audit-issue-cell">
                        <span className={`severity-badge ${issue.severity}`}>{issue.severity}</span>
                        <strong>{ISSUE_LABELS[issue.issueCode] || issue.issueCode}</strong>
                        <small>{issue.message}</small>
                      </div>
                    </td>
                    <td>
                      <button type="button" className="secondary-btn" onClick={() => openFixTarget(issue)}>
                        Fix Path
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {snapshot?.issues?.length ? (
        <section className="panel audit-help-panel">
          <h3>Recommended Fix Order</h3>
          <ol>
            <li>Resolve missing organization and branch assignments first.</li>
            <li>Then fix invalid or cross-organization supervisors.</li>
            <li>Finally, assign missing supervisors and resolve any cycles.</li>
          </ol>
        </section>
      ) : null}
    </div>
  )
}

