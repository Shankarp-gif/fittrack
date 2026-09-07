import { useState, useEffect } from 'react'
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
  supervisorId?: number
}

interface HierarchyUser extends User {
  supervisorName?: string
  subordinates?: HierarchyUser[]
  level?: number
}

export function SupervisorHierarchyPage() {
  const [users, setUsers] = useState<HierarchyUser[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<HierarchyUser | null>(null)
  const [selectedSupervisor, setSelectedSupervisor] = useState<HierarchyUser | null>(null)
  const [hierarchyView, setHierarchyView] = useState<'tree' | 'list'>('tree')
  const [filterRole, setFilterRole] = useState<string>('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/users/all')
      const userData = Array.isArray(response.data) ? response.data : response.data.data || []
      setUsers(buildHierarchy(userData))
    } catch (error) {
      console.error('Error fetching users:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load users',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  const buildHierarchy = (userList: User[]): HierarchyUser[] => {
    const userMap = new Map<number, HierarchyUser>()
    const roots: HierarchyUser[] = []

    // First pass: create all users with subordinates array
    userList.forEach((user) => {
      userMap.set(user.id, {
        ...user,
        subordinates: [],
        level: 0,
      } as HierarchyUser)
    })

    // Second pass: build hierarchy and find roots
    userList.forEach((user) => {
      if (user.supervisorId) {
        const supervisor = userMap.get(user.supervisorId)
        if (supervisor) {
          const subordinate = userMap.get(user.id)
          if (subordinate) {
            supervisor.subordinates?.push(subordinate)
            subordinate.level = (supervisor.level || 0) + 1
            subordinate.supervisorName = supervisor.fullName
          }
        }
      } else {
        const root = userMap.get(user.id)
        if (root) {
          root.level = 0
          roots.push(root)
        }
      }
    })

    return roots.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
  }

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

    if (selectedUser.id === selectedSupervisor.id) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'A user cannot be their own supervisor',
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
        message: `${selectedUser.fullName} assigned to ${selectedSupervisor.fullName}`,
        type: 'success',
        duration: 3000,
      })
      await fetchUsers()
      setSelectedUser(null)
      setSelectedSupervisor(null)
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to assign supervisor',
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
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to remove supervisor',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const HierarchyTreeNode = ({ node, depth = 0 }: { node: HierarchyUser; depth?: number }) => {
    return (
      <div className="hierarchy-node" style={{ marginLeft: `${depth * 24}px` }}>
        <div className="node-header">
          <span className="node-info">
            <strong>{node.fullName}</strong>
            <span className="node-role">{node.role}</span>
            {node.level !== undefined && <span className="node-level">Level {node.level}</span>}
          </span>
          <button
            className="edit-btn"
            onClick={() => setSelectedUser(node)}
            title="Edit supervisor"
          >
            ✏️
          </button>
        </div>
        {node.subordinates && node.subordinates.length > 0 && (
          <div className="node-children">
            {node.subordinates.map((child) => (
              <HierarchyTreeNode key={child.id} node={child} depth={(depth || 0) + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const filteredUsers = users.filter((u) => {
    if (!filterRole) return true
    return u.role === filterRole || u.subordinates?.some((s) => s.role === filterRole)
  })

  return (
    <div className="supervisor-hierarchy-container">
      <section className="panel">
        <h1>🏢 Supervisor Hierarchy Management</h1>
        <p className="muted">Organize your gym staff into a hierarchy with supervisors and their teams.</p>
      </section>

      {/* Controls */}
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
              <option value="ADMIN">Admin/Gym Owner</option>
              <option value="TRAINER">Trainer</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="USER">Member</option>
            </select>
          </div>

          <button onClick={fetchUsers} className="primary-btn" disabled={loading}>
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </section>

      <div className="hierarchy-layout">
        {/* Assignment Panel */}
        <section className="panel assignment-panel">
          <h2>📋 Assign Supervisor</h2>

          <div className="assignment-form">
            <div className="form-group">
              <label>Select User:</label>
              <select
                onChange={(e) => {
                  const userId = parseInt(e.target.value)
                  const selected = users.find((u) => u.id === userId)
                  setSelectedUser(selected || null)
                }}
                className="form-control"
              >
                <option value="">-- Choose a user --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div className="selected-info">
                  <strong>{selectedUser.fullName}</strong>
                  <p>Current Supervisor: {selectedUser.supervisorName || 'None'}</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Assign Supervisor:</label>
              <select
                onChange={(e) => {
                  const supervisorId = parseInt(e.target.value)
                  const selected = users.find((u) => u.id === supervisorId)
                  setSelectedSupervisor(selected || null)
                }}
                className="form-control"
              >
                <option value="">-- Choose a supervisor --</option>
                {users
                  .filter((u) => u.id !== selectedUser?.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role})
                    </option>
                  ))}
              </select>
              {selectedSupervisor && (
                <div className="selected-info">
                  <strong>{selectedSupervisor.fullName}</strong>
                  <p>Role: {selectedSupervisor.role}</p>
                </div>
              )}
            </div>

            <button onClick={assignSupervisor} className="primary-btn" disabled={!selectedUser || !selectedSupervisor}>
              ✅ Assign Supervisor
            </button>

            {selectedUser && selectedUser.supervisorId && (
              <button onClick={() => removeSupervisor(selectedUser.id)} className="danger-btn">
                ❌ Remove Supervisor
              </button>
            )}
          </div>
        </section>

        {/* Hierarchy Display */}
        <section className="panel hierarchy-panel">
          <h2>{hierarchyView === 'tree' ? '🌳 Hierarchy Tree' : '📊 Hierarchy List'}</h2>

          {loading ? (
            <p className="muted">Loading hierarchy...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="muted">No users found with the selected filters.</p>
          ) : hierarchyView === 'tree' ? (
            <div className="hierarchy-tree">
              {filteredUsers.map((root) => (
                <HierarchyTreeNode key={root.id} node={root} />
              ))}
            </div>
          ) : (
            <table className="hierarchy-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Level</th>
                  <th>Supervisor</th>
                  <th>Subordinates</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hierarchy-row">
                    <td>{u.fullName}</td>
                    <td>{u.role}</td>
                    <td>{u.level ?? 0}</td>
                    <td>{u.supervisorName || 'Root'}</td>
                    <td>{u.subordinates?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* Info Panel */}
      <section className="panel info-panel">
        <h3>ℹ️ Hierarchy Levels</h3>
        <ul>
          <li><strong>Level 0:</strong> Root users (no supervisor) - Typically Super Admin or Gym Owner</li>
          <li><strong>Level 1:</strong> Direct reports to Level 0 - Typically Admins</li>
          <li><strong>Level 2+:</strong> Cascade down - Trainers, Receptionists, etc.</li>
        </ul>
        <p>Use this page to establish clear reporting structures for your gym organization.</p>
      </section>
    </div>
  )
}

