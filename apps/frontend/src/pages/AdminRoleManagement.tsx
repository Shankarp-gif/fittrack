import { useState, useEffect } from 'react'
import { Shield, Users, Edit2, Save, X, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { GymRole } from '../types/auth'
import '../styles/AdminRoleManagement.css'

interface User {
  id: number
  fullName: string
  email: string
  role: GymRole
  active: boolean
  createdAt: string
  organizationId?: number
  organizationName?: string
}

const AVAILABLE_ROLES: GymRole[] = ['ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER']


export function AdminRoleManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState<GymRole | ''>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [showRoleGuide, setShowRoleGuide] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/users/all')
      setUsers(Array.isArray(response.data) ? response.data : [])
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

  const handleChangeRole = async (userId: number) => {
    if (!selectedRole) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Please select a role',
        type: 'error',
        duration: 3000,
      })
      return
    }

    try {
      await api.post('/api/users/change-role', {
        userId,
        newRole: selectedRole,
      })

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Success',
        message: `User role changed to ${selectedRole}`,
        type: 'success',
        duration: 3000,
      })

      await fetchUsers()
      setEditingId(null)
      setSelectedRole('')
    } catch (error: any) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: error?.response?.data?.message || 'Failed to change role',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const canManageUser = (target: User): boolean => {
    if (!currentUser || target.id === currentUser.id) return false
    if (currentUser.role === 'SUPER_ADMIN') return true
    if (currentUser.role === 'ADMIN') {
      return target.role !== 'SUPER_ADMIN' && target.role !== 'ADMIN'
    }
    return false
  }

  const getAssignableRoles = (): GymRole[] => {
    if (!currentUser) return []
    if (currentUser.role === 'SUPER_ADMIN') {
      return AVAILABLE_ROLES
    }
    if (currentUser.role === 'ADMIN') {
      return ['TRAINER', 'RECEPTIONIST', 'USER']
    }
    return []
  }

  const filteredUsers = users.filter((u) => {
    if (filterActive === 'active' && !u.active) return false
    if (filterActive === 'inactive' && u.active) return false
    if (
      !u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !u.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const getRoleColor = (role: GymRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'role-super-admin'
      case 'ADMIN':
        return 'role-admin'
      case 'TRAINER':
        return 'role-trainer'
      case 'RECEPTIONIST':
        return 'role-receptionist'
      case 'USER':
        return 'role-user'
      default:
        return 'role-default'
    }
  }

  const getRoleDescription = (role: GymRole) => {
    const descriptions: Record<GymRole, string> = {
      SUPER_ADMIN: 'Manage all organizations and system settings',
      ADMIN: 'Manage gym operations, users, and members',
      TRAINER: 'Manage training sessions and member progress',
      RECEPTIONIST: 'Handle check-ins, registrations, and fees',
      USER: 'Member - Track workouts and personal progress',
    }
    return descriptions[role]
  }

  return (
    <div className="admin-role-management">
      {/* Header */}
      <section className="role-management-header">
        <div className="header-content">
          <div>
            <h1>
              <Shield size={32} />
              Role & Privilege Management
            </h1>
            <p className="muted">Manage user roles and permissions</p>
          </div>
          <button
            onClick={() => setShowRoleGuide(!showRoleGuide)}
            className="secondary-btn"
          >
            📋 Role Guide
          </button>
        </div>
      </section>

      {/* Role Guide */}
      {showRoleGuide && (
        <section className="role-guide-section">
          <div className="role-guide">
            <h3>Role Hierarchy & Permissions</h3>
            <div className="roles-grid">
              {AVAILABLE_ROLES.map((role) => (
                <div key={role} className={`role-card ${getRoleColor(role)}`}>
                  <h4>{role === 'USER' ? 'Member' : role}</h4>
                  <p>{getRoleDescription(role)}</p>
                  <div className="default-password">
                    <small>Password: Auto-generated on account creation</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="role-management-filters">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as any)}
          className="filter-select"
        >
          <option value="all">All Users</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <span className="filter-result">{filteredUsers.length} users found</span>
      </section>

      {/* Users Table */}
      <section className="role-management-table">
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <h3>No Users Found</h3>
            <p>No users match your search criteria</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-role-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Organization</th>
                  <th>Current Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={!u.active ? 'inactive-row' : ''}>
                    <td className="user-name">
                      <strong>{u.fullName}</strong>
                    </td>
                    <td className="user-email">{u.email}</td>
                    <td className="user-org">
                      {u.organizationName || 'N/A'}
                    </td>
                    <td className="user-role">
                      {editingId === u.id ? (
                        <select
                          value={selectedRole}
                          onChange={(e) =>
                            setSelectedRole((e.target.value as GymRole) || '')
                          }
                          className="role-select-edit"
                        >
                          <option value="">Select Role</option>
                          {getAssignableRoles().map((role) => (
                            <option key={role} value={role}>
                              {role === 'USER' ? 'Member' : role}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`role-badge ${getRoleColor(u.role)}`}>
                          {u.role === 'USER' ? 'Member' : u.role}
                        </span>
                      )}
                    </td>
                    <td className="user-status">
                      <span className={`status-badge ${u.active ? 'active' : 'inactive'}`}>
                        {u.active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td className="user-joined">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="user-actions">
                      {editingId === u.id ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={() => handleChangeRole(u.id)}
                            title="Save"
                            disabled={!canManageUser(u) || !selectedRole}
                          >
                            <Save size={16} />
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              setEditingId(null)
                              setSelectedRole('')
                            }}
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-edit"
                          onClick={() => {
                            setEditingId(u.id)
                            setSelectedRole(u.role)
                          }}
                          title="Change Role"
                          disabled={!canManageUser(u)}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Privileges Info */}
      <section className="privileges-info">
        <h3>Your Privileges</h3>
        <div className="privileges-grid">
          <div className="privilege-card">
            <CheckCircle size={24} />
            <h4>Current Role</h4>
            <p>{currentUser?.role === 'USER' ? 'Member' : currentUser?.role}</p>
          </div>
          <div className="privilege-card">
            <Shield size={24} />
            <h4>Manageable Roles</h4>
            <p>
              {getAssignableRoles().length > 0
                ? getAssignableRoles()
                    .map((r) => (r === 'USER' ? 'Member' : r))
                    .join(', ')
                : 'None'}
            </p>
          </div>
          <div className="privilege-card">
            <Users size={24} />
            <h4>Manageable Users</h4>
            <p>
              {users.filter((u) => canManageUser(u)).length} users
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

