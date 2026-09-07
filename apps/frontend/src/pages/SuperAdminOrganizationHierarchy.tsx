import { useState, useEffect } from 'react'
import {
  Building2,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Users,
  ArrowLeft,
  Shield,
  UserCheck,
  Briefcase,
  User,
} from 'lucide-react'
import { api } from '../services/api'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { GymRole } from '../types/auth'
import '../styles/SuperAdminOrganizationHierarchy.css'

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
  categoryId?: number
  establishmentYear?: number
  memberCapacity?: number
  facilities?: string
  createdAt?: string
  updatedAt?: string
}

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

interface CreateOrgRequest {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  categoryId?: number
  establishmentYear?: number
  memberCapacity?: number
  facilities?: string
}

export function SuperAdminOrganizationHierarchy() {
  // Navigation State
  const [view, setView] = useState<'organizations' | 'organization-detail'>('organizations')
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)

  // Data State
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  // Form State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<CreateOrgRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
  })

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<GymRole | ''>('')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/users/organization/all')
      setOrganizations(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching organizations:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load organizations',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganizationUsers = async (orgId: number) => {
    try {
      const response = await api.get(`/api/users/organization/${orgId}/users`)
      setUsers(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching users:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load users for this organization',
        type: 'error',
        duration: 4000,
      })
      setUsers([])
    }
  }

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrganization(org)
    setView('organization-detail')
    fetchOrganizationUsers(org.id)
    setSearchTerm('')
    setFilterRole('')
  }

  const handleBackToOrganizations = () => {
    setView('organizations')
    setSelectedOrganization(null)
    setUsers([])
    setSearchTerm('')
    setFilterRole('')
  }

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        type: 'error',
        duration: 3000,
      })
      return
    }

    try {
      if (editingId) {
        await api.put(`/api/users/organization/${editingId}`, formData)
        showCenteredSuccessModal({
          isOpen: true,
          title: 'Success',
          message: 'Organization updated successfully',
          type: 'success',
          duration: 3000,
        })
      } else {
        await api.post('/api/users/organization/create', formData)
        showCenteredSuccessModal({
          isOpen: true,
          title: 'Success',
          message: 'Organization created successfully',
          type: 'success',
          duration: 3000,
        })
      }
      await fetchOrganizations()
      resetForm()
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Operation failed',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const handleEdit = (org: Organization) => {
    setEditingId(org.id)
    setFormData({
      name: org.name,
      email: org.email,
      phone: org.phone,
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      categoryId: org.categoryId,
      establishmentYear: org.establishmentYear,
      memberCapacity: org.memberCapacity,
      facilities: org.facilities,
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this organization?')) {
      try {
        await api.delete(`/api/users/organization/${id}`)
        showCenteredSuccessModal({
          isOpen: true,
          title: 'Success',
          message: 'Organization deactivated',
          type: 'success',
          duration: 3000,
        })
        await fetchOrganizations()
      } catch (error) {
        showCenteredSuccessModal({
          isOpen: true,
          title: 'Error',
          message: 'Failed to deactivate organization',
          type: 'error',
          duration: 4000,
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
    })
    setEditingId(null)
    setShowCreateModal(false)
  }

  const getRoleIcon = (role: GymRole) => {
    switch (role) {
      case 'ADMIN':
        return <Shield size={16} />
      case 'TRAINER':
        return <Briefcase size={16} />
      case 'GYM_MAINTENANCE_MANAGER':
        return <UserCheck size={16} />
      case 'USER':
        return <User size={16} />
      default:
        return <Users size={16} />
    }
  }


  const usersByRole = users.reduce(
    (acc, user) => {
      const role = user.role
      if (!acc[role]) {
        acc[role] = []
      }
      acc[role].push(user)
      return acc
    },
    {} as Record<GymRole, User[]>
  )

  const filteredUsersByRole = Object.entries(usersByRole).reduce(
    (acc, [role, roleUsers]) => {
      const filtered = roleUsers.filter((u) => {
        const matchesSearch =
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = !filterRole || u.role === filterRole
        return matchesSearch && matchesRole
      })
      if (filtered.length > 0) {
        acc[role as GymRole] = filtered
      }
      return acc
    },
    {} as Record<GymRole, User[]>
  )

  // ============ RENDER ORGANIZATIONS VIEW ============
  if (view === 'organizations') {
    return (
      <div className="superadmin-hierarchy">
        {/* Header */}
        <section className="hierarchy-header">
          <div className="header-content">
            <div>
              <h1>
                <Building2 size={32} />
                Organization Hierarchy
              </h1>
              <p className="muted">Manage all organizations and their users</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="primary-btn">
              <Plus size={18} /> Add Organization
            </button>
          </div>
        </section>

        {/* Organizations Grid */}
        <section className="organizations-grid-section">
          {loading ? (
            <div className="loading-state">
              <p>Loading organizations...</p>
            </div>
          ) : organizations.length === 0 ? (
            <div className="empty-state">
              <Building2 size={64} />
              <h2>No Organizations Yet</h2>
              <p>Create your first organization to get started</p>
              <button onClick={() => setShowCreateModal(true)} className="primary-btn">
                <Plus size={18} /> Create First Organization
              </button>
            </div>
          ) : (
            <div className="orgs-grid">
              {organizations.map((org) => (
                <div key={org.id} className={`org-hierarchy-card ${!org.active ? 'inactive' : ''}`}>
                  <div className="org-card-header">
                    <div className="org-header-content">
                      <h3>{org.name}</h3>
                      <span className={`org-status ${org.active ? 'active' : 'inactive'}`}>
                        {org.active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                    <div className="org-header-actions">
                      <button
                        onClick={() => handleEdit(org)}
                        className="icon-btn edit"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(org.id)}
                        className="icon-btn delete"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="org-card-info">
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{org.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{org.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Location:</span>
                      <span className="value">
                        {org.city}, {org.state}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectOrganization(org)}
                    className="view-users-btn"
                  >
                    View Users <ChevronRight size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{editingId ? '✏️ Edit Organization' : '➕ Create Organization'}</h2>
                <button onClick={resetForm} className="close-btn">
                  <X size={24} />
                </button>
              </div>

              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Organization Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="Enter organization name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      placeholder="example@gym.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                      placeholder="+1234567890"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="form-input"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="form-input"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="form-input"
                      placeholder="State/Province"
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="form-input"
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={resetForm} className="secondary-btn">
                  Cancel
                </button>
                <button onClick={handleCreateOrUpdate} className="primary-btn">
                  <Check size={18} /> {editingId ? 'Update' : 'Create'} Organization
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ============ RENDER ORGANIZATION DETAIL VIEW ============
  return (
    <div className="superadmin-hierarchy">
      {/* Back Button & Header */}
      <section className="hierarchy-detail-header">
        <button onClick={handleBackToOrganizations} className="back-btn">
          <ArrowLeft size={18} /> Back to Organizations
        </button>
        <div className="detail-header-content">
          <h1>
            <Building2 size={32} />
            {selectedOrganization?.name}
          </h1>
          <p className="muted">Manage users and admins for this organization</p>
        </div>
      </section>

      {/* Organization Info Cards */}
      {selectedOrganization && (
        <section className="org-detail-info">
          <div className="info-cards">
            <div className="info-card">
              <h4>📧 Email</h4>
              <p>{selectedOrganization.email}</p>
            </div>
            <div className="info-card">
              <h4>📱 Phone</h4>
              <p>{selectedOrganization.phone}</p>
            </div>
            <div className="info-card">
              <h4>📍 Location</h4>
              <p>
                {selectedOrganization.city}, {selectedOrganization.state}
              </p>
            </div>
            <div className="info-card">
              <h4>🌍 Country</h4>
              <p>{selectedOrganization.country}</p>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="detail-filters">
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
          <option value="ADMIN">Admins</option>
          <option value="TRAINER">Trainers</option>
          <option value="GYM_MAINTENANCE_MANAGER">Gym Maintenance Managers</option>
          <option value="USER">Members</option>
        </select>
      </section>

      {/* Users by Role */}
      <section className="users-by-role-section">
        {loading ? (
          <div className="loading-state">
            <p>Loading users...</p>
          </div>
        ) : Object.keys(filteredUsersByRole).length === 0 ? (
          <div className="empty-state">
            <Users size={64} />
            <h2>No Users Found</h2>
            <p>This organization doesn't have any users yet</p>
          </div>
        ) : (
          Object.entries(filteredUsersByRole).map(([role, roleUsers]) => (
            <div key={role} className="role-section">
              <div className="role-section-header">
                <h3>
                  {getRoleIcon(role as GymRole)}
                  {role === 'USER' ? 'Members' : role}
                </h3>
                <span className="role-user-count">{roleUsers.length}</span>
              </div>

              <div className="role-users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleUsers.map((user) => (
                      <tr key={user.id} className={!user.active ? 'inactive' : ''}>
                        <td className="user-name">
                          <strong>{user.fullName}</strong>
                        </td>
                        <td className="user-email">{user.email}</td>
                        <td className="user-status">
                          <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                            {user.active ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </td>
                        <td className="user-joined">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}

