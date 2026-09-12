import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { GymRole } from '../types/auth'
import '../styles/HierarchyManagement.css'

interface User {
  id: number
  fullName: string
  email: string
  role: GymRole
  active: boolean
  createdAt: string
  organizationId?: number
  organizationName?: string
  branchId?: number
  branchName?: string
  supervisorId?: number
  supervisorName?: string
}

interface HierarchyUser extends User {
  subordinates: HierarchyUser[]
  level: number
}

const ALLOWED_SUPERVISORS: Record<GymRole, GymRole[]> = {
  SUPER_ADMIN: [],
  ADMIN: ['SUPER_ADMIN'],
  TRAINER: ['SUPER_ADMIN', 'ADMIN'],
  GYM_MAINTENANCE_MANAGER: ['SUPER_ADMIN', 'ADMIN'],
  USER: ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER'],
}

const ROLE_LABELS: Record<GymRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  TRAINER: 'Trainer',
  GYM_MAINTENANCE_MANAGER: 'Gym Maintenance Manager',
  USER: 'Member',
}

function buildHierarchy(userList: User[]): HierarchyUser[] {
  const userMap = new Map<number, HierarchyUser>()

  userList.forEach((user) => {
    userMap.set(user.id, {
      ...user,
      subordinates: [],
      level: 0,
    })
  })

  userList.forEach((user) => {
    if (!user.supervisorId) {
      return
    }

    const node = userMap.get(user.id)
    const supervisor = userMap.get(user.supervisorId)
    if (!node || !supervisor) {
      return
    }

    supervisor.subordinates.push(node)
    node.supervisorName = node.supervisorName || supervisor.fullName
  })

  const assignLevels = (nodes: HierarchyUser[], level: number): HierarchyUser[] => {
    return [...nodes]
      .sort((left, right) => left.fullName.localeCompare(right.fullName))
      .map((node) => ({
        ...node,
        level,
        subordinates: assignLevels(node.subordinates, level + 1),
      }))
  }

  const roots = Array.from(userMap.values()).filter((user) => !user.supervisorId || !userMap.has(user.supervisorId))
  return assignLevels(roots, 0)
}

function filterHierarchy(nodes: HierarchyUser[], role: string): HierarchyUser[] {
  if (!role) {
    return nodes
  }

  return nodes
    .map((node) => {
      const matchingChildren = filterHierarchy(node.subordinates, role)
      if (node.role === role || matchingChildren.length > 0) {
        return {
          ...node,
          subordinates: matchingChildren,
        }
      }
      return null
    })
    .filter((node): node is HierarchyUser => node !== null)
}

export function SupervisorHierarchyPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<number | ''>('')
  const [hierarchyView, setHierarchyView] = useState<'tree' | 'list'>('tree')
  const [filterRole, setFilterRole] = useState<string>('')

  useEffect(() => {
    void fetchUsers()
  }, [])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  )

  const selectedSupervisor = useMemo(
    () => users.find((user) => user.id === selectedSupervisorId) ?? null,
    [selectedSupervisorId, users],
  )

  const hierarchyRoots = useMemo(() => buildHierarchy(users), [users])

  const hierarchyLevelByUserId = useMemo(() => {
    const levels = new Map<number, number>()

    const visit = (nodes: HierarchyUser[]) => {
      nodes.forEach((node) => {
        levels.set(node.id, node.level)
        if (node.subordinates.length > 0) {
          visit(node.subordinates)
        }
      })
    }

    visit(hierarchyRoots)
    return levels
  }, [hierarchyRoots])

  const subordinateCountByUserId = useMemo(() => {
    const counts = new Map<number, number>()
    users.forEach((user) => {
      if (user.supervisorId) {
        counts.set(user.supervisorId, (counts.get(user.supervisorId) ?? 0) + 1)
      }
    })
    return counts
  }, [users])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/users/all')
      const payload = Array.isArray(response.data) ? response.data : response.data?.data || []
      setUsers(Array.isArray(payload) ? payload : [])
    } catch (error: any) {
      console.error('Error fetching users:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to load users',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  const getDescendantIds = (userId: number): Set<number> => {
    const descendants = new Set<number>()
    users
      .filter((user) => user.supervisorId === userId)
      .forEach((report) => {
        descendants.add(report.id)
        getDescendantIds(report.id).forEach((id) => descendants.add(id))
      })
    return descendants
  }

  const validSupervisorOptions = useMemo(() => {
    if (!selectedUser) {
      return []
    }

    const blockedIds = getDescendantIds(selectedUser.id)
    const allowedRoles = ALLOWED_SUPERVISORS[selectedUser.role] || []

    return users.filter((candidate) => {
      if (candidate.id === selectedUser.id || blockedIds.has(candidate.id) || !candidate.active) {
        return false
      }

      if (!allowedRoles.includes(candidate.role)) {
        return false
      }

      if (candidate.role === 'SUPER_ADMIN') {
        return true
      }

      if (!selectedUser.organizationId || !candidate.organizationId) {
        return false
      }

      return candidate.organizationId === selectedUser.organizationId
    })
  }, [selectedUser, users])

  const filteredTreeUsers = useMemo(
    () => filterHierarchy(hierarchyRoots, filterRole),
    [filterRole, hierarchyRoots],
  )

  const filteredListUsers = useMemo(
    () => (!filterRole ? users : users.filter((user) => user.role === filterRole)),
    [filterRole, users],
  )

  const assignSupervisor = async () => {
    if (!selectedUser || !selectedSupervisor) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Please select both a user and a supervisor',
        type: 'error',
        duration: 4000,
      })
      return
    }

    try {
      await api.put(`/api/users/${selectedUser.id}/supervisor/${selectedSupervisor.id}`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Success',
        message: `${selectedUser.fullName} now reports to ${selectedSupervisor.fullName}`,
        type: 'success',
        duration: 3000,
      })
      await fetchUsers()
      setSelectedUserId('')
      setSelectedSupervisorId('')
    } catch (error: any) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to assign supervisor',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const removeSupervisor = async (userId: number) => {
    try {
      await api.put(`/api/users/${userId}/supervisor/0`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Success',
        message: 'Supervisor removed successfully',
        type: 'success',
        duration: 3000,
      })
      await fetchUsers()
      if (selectedUserId === userId) {
        setSelectedSupervisorId('')
      }
    } catch (error: any) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to remove supervisor',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const HierarchyTreeNode = ({ node, depth = 0 }: { node: HierarchyUser; depth?: number }) => (
    <div className="hierarchy-node" style={{ marginLeft: `${depth * 24}px` }}>
      <div className="node-header">
        <span className="node-info">
          <strong>{node.fullName}</strong>
          <span className="node-role">{ROLE_LABELS[node.role]}</span>
          <span className="node-level">Level {node.level}</span>
          <span className="node-level">{node.organizationName || 'Unassigned'}</span>
        </span>
        <button
          className="edit-btn"
          onClick={() => {
            setSelectedUserId(node.id)
            setSelectedSupervisorId(node.supervisorId ?? '')
          }}
          title="Edit supervisor"
        >
          ✏️
        </button>
      </div>
      {node.subordinates.length > 0 && (
        <div className="node-children">
          {node.subordinates.map((child) => (
            <HierarchyTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="supervisor-hierarchy-container">
      <section className="panel">
        <h1>🏢 Supervisor Hierarchy Management</h1>
        <p className="muted">Build a clean reporting structure inside each organization.</p>
      </section>

      <section className="panel controls-panel">
        <div className="controls-row">
          <div className="control-group">
            <label htmlFor="view-toggle">View Mode:</label>
            <select
              id="view-toggle"
              value={hierarchyView}
              onChange={(e) => setHierarchyView(e.target.value as 'tree' | 'list')}
              className="control-select"
            >
              <option value="tree">Tree View</option>
              <option value="list">List View</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="role-filter">Filter by Role:</label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="control-select"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="TRAINER">Trainer</option>
              <option value="GYM_MAINTENANCE_MANAGER">Gym Maintenance Manager</option>
              <option value="USER">Member</option>
            </select>
          </div>

          <button onClick={() => void fetchUsers()} className="primary-btn" disabled={loading}>
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </section>

      <div className="hierarchy-layout">
        <section className="panel assignment-panel">
          <h2>📋 Assign Supervisor</h2>

          <div className="assignment-form">
            <div className="form-group">
              <label>Select User:</label>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  const userId = Number(e.target.value)
                  if (Number.isNaN(userId) || userId <= 0) {
                    setSelectedUserId('')
                    setSelectedSupervisorId('')
                    return
                  }

                  const nextUser = users.find((user) => user.id === userId)
                  setSelectedUserId(userId)
                  setSelectedSupervisorId(nextUser?.supervisorId ?? '')
                }}
                className="form-control"
              >
                <option value="">-- Choose a user --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({ROLE_LABELS[user.role]})
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div className="selected-info">
                  <strong>{selectedUser.fullName}</strong>
                  <p>Current Supervisor: {selectedUser.supervisorName || 'None'}</p>
                  <p>Organization: {selectedUser.organizationName || 'Unassigned'}</p>
                  <p>Branch: {selectedUser.branchName || 'Unassigned'}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Assign Supervisor:</label>
              <select
                value={selectedSupervisorId}
                onChange={(e) => {
                  const supervisorId = Number(e.target.value)
                  setSelectedSupervisorId(Number.isNaN(supervisorId) || supervisorId <= 0 ? '' : supervisorId)
                }}
                className="form-control"
                disabled={!selectedUser}
              >
                <option value="">-- Choose a supervisor --</option>
                {validSupervisorOptions.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({ROLE_LABELS[user.role]})
                  </option>
                ))}
              </select>
              {selectedSupervisor && (
                <div className="selected-info">
                  <strong>{selectedSupervisor.fullName}</strong>
                  <p>Role: {ROLE_LABELS[selectedSupervisor.role]}</p>
                  <p>Organization: {selectedSupervisor.organizationName || 'Global'}</p>
                </div>
              )}
            </div>

            <button onClick={() => void assignSupervisor()} className="primary-btn" disabled={!selectedUser || !selectedSupervisor}>
              ✅ Assign Supervisor
            </button>

            {selectedUser?.supervisorId ? (
              <button onClick={() => void removeSupervisor(selectedUser.id)} className="danger-btn">
                ❌ Remove Supervisor
              </button>
            ) : null}

            {selectedUser && validSupervisorOptions.length === 0 ? (
              <p className="muted">No valid supervisors are available for the selected user based on role and organization.</p>
            ) : null}
          </div>
        </section>

        <section className="panel hierarchy-panel">
          <h2>{hierarchyView === 'tree' ? '🌳 Hierarchy Tree' : '📊 Hierarchy List'}</h2>

          {loading ? (
            <p className="muted">Loading hierarchy...</p>
          ) : hierarchyView === 'tree' ? (
            filteredTreeUsers.length === 0 ? (
              <p className="muted">No users found with the selected filters.</p>
            ) : (
              <div className="hierarchy-tree">
                {filteredTreeUsers.map((root) => (
                  <HierarchyTreeNode key={root.id} node={root} />
                ))}
              </div>
            )
          ) : filteredListUsers.length === 0 ? (
            <p className="muted">No users found with the selected filters.</p>
          ) : (
            <table className="hierarchy-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Organization</th>
                  <th>Level</th>
                  <th>Supervisor</th>
                  <th>Subordinates</th>
                </tr>
              </thead>
              <tbody>
                {filteredListUsers.map((user) => (
                  <tr key={user.id} className="hierarchy-row">
                    <td>{user.fullName}</td>
                    <td>{ROLE_LABELS[user.role]}</td>
                    <td>{user.organizationName || 'Unassigned'}</td>
                    <td>{hierarchyLevelByUserId.get(user.id) ?? 0}</td>
                    <td>{user.supervisorName || 'Root'}</td>
                    <td>{subordinateCountByUserId.get(user.id) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="panel info-panel">
        <h3>ℹ️ Hierarchy Rules</h3>
        <ul>
          <li><strong>Super Admin</strong> can oversee admins across organizations.</li>
          <li><strong>Admins</strong> can supervise trainers and gym maintenance managers in their own organization.</li>
          <li><strong>Members</strong> can report to a trainer, admin, gym maintenance manager, or super admin.</li>
        </ul>
        <p>Supervisor choices are filtered automatically to prevent cross-organization mismatches and reporting cycles.</p>
      </section>
    </div>
  )
}
