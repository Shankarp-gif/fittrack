import { useState, useEffect } from 'react'
import { Users, Edit2, Trash2, Save, X, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { GymRole } from '../types/auth'
import '../styles/UserManagement.css'

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

interface Organization {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  active: boolean
}

export function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newRole, setNewRole] = useState<GymRole | ''>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<GymRole | ''>('')
  const [activeTab, setActiveTab] = useState<'users' | 'organizations'>('users')

  useEffect(() => {
    fetchUsers()
    if (currentUser?.role === 'SUPER_ADMIN') {
      fetchOrganizations()
    }
  }, [currentUser?.role])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/users/all')
      setUsers(Array.isArray(response.data) ? response.data : [])
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setUsers([])
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Failed to Load Users',
        message: error?.response?.data?.message || 'Unable to fetch users with your current access.',
        type: 'error',
        duration: 4500,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await api.get('/api/users/organization/all')
      setOrganizations(Array.isArray(response.data) ? response.data : [])
    } catch (error: any) {
      console.error('Error fetching organizations:', error)
      setOrganizations([])
    }
  }

  const canChangeRole = (target: User) => {
    if (!currentUser || target.id === currentUser.id) return false
    if (currentUser.role === 'SUPER_ADMIN') return true
    if (currentUser.role === 'ADMIN') {
      return target.role !== 'SUPER_ADMIN' && target.role !== 'ADMIN'
    }
    return false
  }

  const canDeleteUser = (target: User) => {
    if (!currentUser || target.id === currentUser.id) return false
    if (currentUser.role === 'SUPER_ADMIN') return true
    if (currentUser.role === 'ADMIN') return target.role !== 'SUPER_ADMIN' && target.role !== 'ADMIN'
    if (currentUser.role === 'RECEPTIONIST') return target.role === 'USER'
    if (currentUser.role === 'TRAINER') return target.role === 'USER'
    return false
  }

  const getAssignableRoles = (): GymRole[] => {
    if (!currentUser) return []
    if (currentUser.role === 'SUPER_ADMIN') {
      return ['ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER']
    }
    if (currentUser.role === 'ADMIN') {
      return ['TRAINER', 'RECEPTIONIST', 'USER']
    }
    return []
  }

  const handleChangeRole = async (userId: number) => {
    if (!newRole) return

    try {
      await api.post('/api/users/change-role', {
        userId,
        newRole,
      })

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Role Updated',
        message: 'User role changed successfully.',
        type: 'success',
        duration: 3500,
      })

      await fetchUsers()
      setEditingId(null)
      setNewRole('')
    } catch (error: any) {
      console.error('Error changing role:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Role Update Failed',
        message: error?.response?.data?.message || 'Could not change user role.',
        type: 'error',
        duration: 4500,
      })
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return

    try {
      await api.delete(`/api/users/${userId}`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'User Deactivated',
        message: 'User has been deactivated successfully.',
        type: 'success',
        duration: 3500,
      })
      await fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Action Not Allowed',
        message: error?.response?.data?.message || 'Could not deactivate user.',
        type: 'error',
        duration: 4500,
      })
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !filterRole || u.role === filterRole
    return matchesSearch && matchesRole
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

  // Group users by organization for SuperAdmin
  const groupedByOrganization = currentUser?.role === 'SUPER_ADMIN'
    ? users.reduce((acc, user) => {
        const orgName = user.organizationName || 'Unassigned'
        if (!acc[orgName]) {
          acc[orgName] = []
        }
        acc[orgName].push(user)
        return acc
      }, {} as Record<string, User[]>)
    : null

  const assignableRoles = getAssignableRoles()
  const canAnyRoleEdit = assignableRoles.length > 0

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={32} style={{ marginRight: '12px' }} />
            {currentUser?.role === 'SUPER_ADMIN' ? 'User & Organization Management' : 'User Management'}
          </h1>
          <p className="page-subtitle">
            {currentUser?.role === 'SUPER_ADMIN'
              ? 'Manage users and organizations across all gyms'
              : 'Manage users based on your role permissions'}
          </p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat">
            <span className="stat-value">{users.filter((u) => u.active).length}</span>
            <span className="stat-label">Active</span>
          </div>
        </div>
      </div>

      {/* Tabs for SuperAdmin */}
      {currentUser?.role === 'SUPER_ADMIN' && (
        <div className="tabs-section">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Users
          </button>
          <button
            className={`tab-btn ${activeTab === 'organizations' ? 'active' : ''}`}
            onClick={() => setActiveTab('organizations')}
          >
            <Building2 size={18} />
            Organizations
          </button>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          <div className="filters-section">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole((e.target.value as GymRole) || '')}
              className="filter-select"
            >
              <option value="">All Roles</option>
              {currentUser?.role === 'SUPER_ADMIN' && <option value="ADMIN">Admin</option>}
              <option value="TRAINER">Trainer</option>
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="USER">Member</option>
            </select>
            <span className="filter-result">{filteredUsers.length} users found</span>
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : currentUser?.role === 'SUPER_ADMIN' && groupedByOrganization ? (
            // Organization-wise view for SuperAdmin
            <div className="org-wise-users">
              {Object.entries(groupedByOrganization).map(([orgName, orgUsers]) => {
                const filteredOrgUsers = orgUsers.filter((u) => {
                  const matchesSearch =
                    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchTerm.toLowerCase())
                  const matchesRole = !filterRole || u.role === filterRole
                  return matchesSearch && matchesRole
                })

                return (
                  <div key={orgName} className="organization-section">
                    <div className="org-header">
                      <h3>{orgName}</h3>
                      <span className="user-count">{filteredOrgUsers.length} users</span>
                    </div>
                    <div className="users-table-container">
                      <table className="users-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrgUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="empty-state">
                                No users found in this organization
                              </td>
                            </tr>
                          ) : (
                            filteredOrgUsers.map((u) => (
                              <tr key={u.id} className={`user-row ${!u.active ? 'inactive' : ''}`}>
                                <td className="user-name">
                                  <strong>{u.fullName}</strong>
                                </td>
                                <td className="user-email">{u.email}</td>
                                <td className="user-role">
                                  {editingId === u.id && canAnyRoleEdit ? (
                                    <select
                                      value={newRole}
                                      onChange={(e) => setNewRole((e.target.value as GymRole) || '')}
                                      className="role-select-edit"
                                    >
                                      <option value="">Select Role</option>
                                      {assignableRoles.map((role) => (
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
                                <td className="user-joined">{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="user-actions">
                                  {editingId === u.id ? (
                                    <>
                                      <button
                                        className="btn-save"
                                        onClick={() => handleChangeRole(u.id)}
                                        title="Save"
                                        disabled={!canChangeRole(u)}
                                      >
                                        <Save size={16} />
                                      </button>
                                      <button
                                        className="btn-cancel"
                                        onClick={() => {
                                          setEditingId(null)
                                          setNewRole('')
                                        }}
                                        title="Cancel"
                                      >
                                        <X size={16} />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        className="btn-edit"
                                        onClick={() => {
                                          setEditingId(u.id)
                                          setNewRole(u.role)
                                        }}
                                        title="Edit Role"
                                        disabled={!canChangeRole(u)}
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteUser(u.id)}
                                        title="Deactivate"
                                        disabled={!canDeleteUser(u)}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Standard table view for Admins
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className={`user-row ${!u.active ? 'inactive' : ''}`}>
                        <td className="user-name">
                          <strong>{u.fullName}</strong>
                        </td>
                        <td className="user-email">{u.email}</td>
                        <td className="user-role">
                          {editingId === u.id && canAnyRoleEdit ? (
                            <select
                              value={newRole}
                              onChange={(e) => setNewRole((e.target.value as GymRole) || '')}
                              className="role-select-edit"
                            >
                              <option value="">Select Role</option>
                              {assignableRoles.map((role) => (
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
                        <td className="user-joined">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="user-actions">
                          {editingId === u.id ? (
                            <>
                              <button
                                className="btn-save"
                                onClick={() => handleChangeRole(u.id)}
                                title="Save"
                                disabled={!canChangeRole(u)}
                              >
                                <Save size={16} />
                              </button>
                              <button
                                className="btn-cancel"
                                onClick={() => {
                                  setEditingId(null)
                                  setNewRole('')
                                }}
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-edit"
                                onClick={() => {
                                  setEditingId(u.id)
                                  setNewRole(u.role)
                                }}
                                title="Edit Role"
                                disabled={!canChangeRole(u)}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteUser(u.id)}
                                title="Deactivate"
                                disabled={!canDeleteUser(u)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="role-stats">
            {currentUser?.role === 'SUPER_ADMIN' && (
              <div className="role-stat-card admin">
                <h3>Admins</h3>
                <p className="count">{users.filter((u) => u.role === 'ADMIN').length}</p>
              </div>
            )}
            <div className="role-stat-card trainer">
              <h3>Trainers</h3>
              <p className="count">{users.filter((u) => u.role === 'TRAINER').length}</p>
            </div>
            <div className="role-stat-card receptionist">
              <h3>Receptionists</h3>
              <p className="count">{users.filter((u) => u.role === 'RECEPTIONIST').length}</p>
            </div>
            <div className="role-stat-card member">
              <h3>Members</h3>
              <p className="count">{users.filter((u) => u.role === 'USER').length}</p>
            </div>
          </div>
        </>
      )}

      {/* Organizations Tab */}
      {activeTab === 'organizations' && currentUser?.role === 'SUPER_ADMIN' && (
        <div className="organizations-section">
          <div className="orgs-grid">
            {organizations.map((org) => (
              <div key={org.id} className="org-card">
                <div className="org-card-header">
                  <h3>{org.name}</h3>
                  <span className={`org-status ${org.active ? 'active' : 'inactive'}`}>
                    {org.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="org-card-body">
                  <p><strong>Email:</strong> {org.email}</p>
                  <p><strong>Phone:</strong> {org.phone}</p>
                  <p><strong>Location:</strong> {org.city}, {org.state}</p>
                  <p><strong>Address:</strong> {org.address}</p>
                  <p><strong>Country:</strong> {org.country}</p>
                </div>
                <div className="org-card-footer">
                  <button className="btn-view">View Users</button>
                  <button className="btn-edit-org">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


