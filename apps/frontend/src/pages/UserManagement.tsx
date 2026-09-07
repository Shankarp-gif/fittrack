import { useState, useEffect } from 'react'
import { Users, Edit2, Trash2, Save, X, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { Modal } from '../components/common/Modal'
import {
  userService,
  type ManageableUser,
  type ManagedOrganization,
  type CreateManagedUserRequest,
} from '../services/userService'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { GymRole } from '../types/auth'
import '../styles/UserManagement.css'

type User = ManageableUser
type Organization = ManagedOrganization

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
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | 'ALL'>('ALL')
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  const [createUserForm, setCreateUserForm] = useState<CreateManagedUserRequest>({
    fullName: '',
    email: '',
    role: 'TRAINER',
  })

  const normalizeUser = (item: Partial<User>): User => ({
    id: Number(item.id) || 0,
    employeeIdNumber: item.employeeIdNumber ? String(item.employeeIdNumber) : undefined,
    fullName: String(item.fullName || 'Unknown User'),
    email: String(item.email || '-'),
    role: (item.role || 'USER') as GymRole,
    active: Boolean(item.active),
    createdAt: String(item.createdAt || ''),
    organizationId: item.organizationId,
    organizationName: item.organizationName,
  })

  const normalizeOrganization = (item: Partial<Organization>): Organization => ({
    id: Number(item.id) || 0,
    name: String(item.name || 'Unknown Organization'),
    email: String(item.email || '-'),
    phone: String(item.phone || '-'),
    address: String(item.address || '-'),
    city: String(item.city || '-'),
    state: String(item.state || '-'),
    country: String(item.country || '-'),
    active: Boolean(item.active),
  })

  const formatDate = (value?: string) => {
    if (!value) return '-'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleDateString()
  }

  const getDefaultPasswordForRole = (role: GymRole) => {
    switch (role) {
      case 'ADMIN':
        return 'admin123'
      case 'TRAINER':
        return 'trainer123'
      case 'GYM_MAINTENANCE_MANAGER':
        return 'gmm123'
      case 'USER':
        return 'member123'
      case 'SUPER_ADMIN':
        return 'superadmin123'
      default:
        return 'member123'
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await userService.getAllUsers()
      setUsers(Array.isArray(response) ? response.map((item) => normalizeUser(item)) : [])
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
      const response = await userService.getAllOrganizations()
      setOrganizations(Array.isArray(response) ? response.map((item) => normalizeOrganization(item)) : [])
    } catch (error: any) {
      console.error('Error fetching organizations:', error)
      setOrganizations([])
    }
  }

  useEffect(() => {
    void fetchUsers()
    if (currentUser?.role === 'SUPER_ADMIN') {
      void fetchOrganizations()
    }
  }, [currentUser?.role])

  useEffect(() => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      return
    }

    const matchedCurrentUser = users.find((item) => item.email?.toLowerCase() === currentUser?.email?.toLowerCase())
    setCreateUserForm((prev) => ({
      ...prev,
      organizationId: matchedCurrentUser?.organizationId,
    }))
  }, [currentUser?.email, currentUser?.role, users])

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
    if (currentUser.role === 'GYM_MAINTENANCE_MANAGER') return target.role === 'USER'
    if (currentUser.role === 'TRAINER') return target.role === 'USER'
    return false
  }

  const getAssignableRoles = (): GymRole[] => {
    if (!currentUser) return []
    if (currentUser.role === 'SUPER_ADMIN') {
      return ['ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER', 'USER']
    }
    if (currentUser.role === 'ADMIN') {
      return ['TRAINER', 'GYM_MAINTENANCE_MANAGER', 'USER']
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

  const handleOpenCreateUser = () => {
    setCreateUserForm({
      fullName: '',
      email: '',
      role: currentUser?.role === 'SUPER_ADMIN' ? 'ADMIN' : 'TRAINER',
      organizationId: currentUser?.role === 'SUPER_ADMIN'
        ? undefined
        : users.find((item) => item.email?.toLowerCase() === currentUser?.email?.toLowerCase())?.organizationId,
    })
    setShowCreateUserModal(true)
  }

  const handleCreateUser = async () => {
    const payload: CreateManagedUserRequest = {
      fullName: createUserForm.fullName.trim(),
      email: createUserForm.email.trim(),
      role: createUserForm.role,
      organizationId: createUserForm.organizationId,
    }

    if (!payload.fullName) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Full Name Required',
        message: 'Please enter the user full name.',
        type: 'error',
        duration: 3000,
      })
      return
    }

    if (!payload.email) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Email Required',
        message: 'Please enter the user email address.',
        type: 'error',
        duration: 3000,
      })
      return
    }

    if (currentUser?.role === 'SUPER_ADMIN' && !payload.organizationId) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Organization Required',
        message: 'Select an organization before creating a user.',
        type: 'error',
        duration: 3000,
      })
      return
    }

    setCreatingUser(true)
    try {
      await userService.createUserWithDefaultPassword(payload)
      const defaultPassword = getDefaultPasswordForRole(payload.role)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'User Created',
        message: `User created successfully. Default password: ${defaultPassword}`,
        type: 'success',
        duration: 4500,
      })
      setShowCreateUserModal(false)
      await fetchUsers()
    } catch (error: any) {
      console.error('Error creating user:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'User Creation Failed',
        message: error?.response?.data?.message || 'Unable to create user right now.',
        type: 'error',
        duration: 4500,
      })
    } finally {
      setCreatingUser(false)
    }
  }

  const handleViewOrganizationUsers = async (organizationId: number) => {
    setActiveTab('users')
    setSelectedOrganizationId(organizationId)
    try {
      setLoading(true)
      const orgUsers = await userService.getUsersByOrganization(organizationId)
      setUsers(orgUsers.map((item) => normalizeUser(item)))
    } catch (error) {
      console.error('Error fetching organization users:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Unable to Load Organization Users',
        message: 'Failed to load users for the selected organization.',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetUsers = async () => {
    setSelectedOrganizationId('ALL')
    await fetchUsers()
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !filterRole || u.role === filterRole
    const matchesOrganization = selectedOrganizationId === 'ALL' || u.organizationId === selectedOrganizationId
    return matchesSearch && matchesRole && matchesOrganization
  })

  const getRoleColor = (role: GymRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'role-super-admin'
      case 'ADMIN':
        return 'role-admin'
      case 'TRAINER':
        return 'role-trainer'
      case 'GYM_MAINTENANCE_MANAGER':
        return 'role-receptionist'
      case 'USER':
        return 'role-user'
      default:
        return 'role-default'
    }
  }

  const groupedByOrganization = currentUser?.role === 'SUPER_ADMIN'
    ? filteredUsers.reduce((acc, user) => {
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
        <div className="header-actions">
          {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') ? (
            <button type="button" className="primary-action-btn" onClick={handleOpenCreateUser}>
              Add User
            </button>
          ) : null}
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
      </div>

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
              <option value="GYM_MAINTENANCE_MANAGER">Gym Maintenance Manager</option>
              <option value="USER">Member</option>
            </select>
            {currentUser?.role === 'SUPER_ADMIN' ? (
              <select
                value={selectedOrganizationId === 'ALL' ? 'ALL' : String(selectedOrganizationId)}
                onChange={(e) => setSelectedOrganizationId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="filter-select"
              >
                <option value="ALL">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={String(org.id)}>{org.name}</option>
                ))}
              </select>
            ) : null}
            {currentUser?.role === 'SUPER_ADMIN' && selectedOrganizationId !== 'ALL' ? (
              <button type="button" className="secondary-action-btn" onClick={() => void handleResetUsers()}>
                Clear Org Filter
              </button>
            ) : null}
            <span className="filter-result">{filteredUsers.length} users found</span>
          </div>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : currentUser?.role === 'SUPER_ADMIN' && groupedByOrganization ? (
            <div className="org-wise-users">
              {Object.entries(groupedByOrganization).map(([orgName, orgUsers]) => (
                <div key={orgName} className="organization-section">
                  <div className="org-header">
                    <h3>{orgName}</h3>
                    <span className="user-count">{orgUsers.length} users</span>
                  </div>
                  <div className="users-table-container">
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Employee ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orgUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="empty-state">
                              No users found in this organization
                            </td>
                          </tr>
                        ) : (
                          orgUsers.map((u) => (
                            <tr key={u.id} className={`user-row ${!u.active ? 'inactive' : ''}`}>
                              <td className="user-code">{u.employeeIdNumber || '-'}</td>
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
                              <td className="user-joined">{formatDate(u.createdAt)}</td>
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
              ))}
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
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
                      <td colSpan={7} className="empty-state">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className={`user-row ${!u.active ? 'inactive' : ''}`}>
                        <td className="user-code">{u.employeeIdNumber || '-'}</td>
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
                        <td className="user-joined">{formatDate(u.createdAt)}</td>
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
              <h3>Gym Maintenance Managers</h3>
              <p className="count">{users.filter((u) => u.role === 'GYM_MAINTENANCE_MANAGER').length}</p>
            </div>
            <div className="role-stat-card member">
              <h3>Members</h3>
              <p className="count">{users.filter((u) => u.role === 'USER').length}</p>
            </div>
          </div>
        </>
      )}

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
                  <button className="btn-view" onClick={() => void handleViewOrganizationUsers(org.id)}>View Users</button>
                  <button className="btn-edit-org" onClick={() => setSelectedOrganizationId(org.id)}>Focus</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showCreateUserModal}
        title="Create User"
        onClose={() => setShowCreateUserModal(false)}
        size="sm"
        actions={(
          <>
            <button type="button" className="secondary-action-btn" onClick={() => setShowCreateUserModal(false)}>
              Cancel
            </button>
            <button type="button" className="primary-action-btn" onClick={() => void handleCreateUser()} disabled={creatingUser}>
              {creatingUser ? 'Creating...' : 'Create User'}
            </button>
          </>
        )}
      >
        <div className="create-user-form">
          <label htmlFor="create-user-full-name">Full Name</label>
          <input
            id="create-user-full-name"
            type="text"
            value={createUserForm.fullName}
            onChange={(e) => setCreateUserForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className="filter-input"
            placeholder="Enter full name"
          />

          <label htmlFor="create-user-email">Email</label>
          <input
            id="create-user-email"
            type="email"
            value={createUserForm.email}
            onChange={(e) => setCreateUserForm((prev) => ({ ...prev, email: e.target.value }))}
            className="filter-input"
            placeholder="Enter email address"
          />

          <label htmlFor="create-user-role">Role</label>
          <select
            id="create-user-role"
            value={createUserForm.role}
            onChange={(e) => setCreateUserForm((prev) => ({ ...prev, role: e.target.value as GymRole }))}
            className="filter-select"
          >
            {currentUser?.role === 'SUPER_ADMIN' ? <option value="ADMIN">Admin</option> : null}
            <option value="TRAINER">Trainer</option>
            <option value="GYM_MAINTENANCE_MANAGER">Gym Maintenance Manager</option>
            <option value="USER">Member</option>
          </select>

          {currentUser?.role === 'SUPER_ADMIN' ? (
            <>
              <label htmlFor="create-user-org">Organization</label>
              <select
                id="create-user-org"
                value={createUserForm.organizationId ? String(createUserForm.organizationId) : ''}
                onChange={(e) => setCreateUserForm((prev) => ({
                  ...prev,
                  organizationId: Number(e.target.value) || undefined,
                }))}
                className="filter-select"
              >
                <option value="">Select organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={String(org.id)}>{org.name}</option>
                ))}
              </select>
            </>
          ) : null}

          <p className="create-user-hint">
            Default password for this role: <strong>{getDefaultPasswordForRole(createUserForm.role)}</strong>
          </p>
        </div>
      </Modal>
    </div>
  )
}

