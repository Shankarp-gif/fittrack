import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Search,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react'
import { api } from '../services/api'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import '../styles/SuperAdminDashboard.css'

interface Organization {
  id: number
  name: string
  email: string
  phone: string
  address?: string
  city: string
  state?: string
  country: string
  postalCode?: string
  taxId?: string
  active: boolean
  createdAt: string
}

interface AdminUser {
  id: number
  fullName: string
  email: string
  role: string
  organizationId: number | null
  organizationName: string | null
  active: boolean
  createdAt: string
}

export function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [activeTab, setActiveTab] = useState<'organizations' | 'admins'>('organizations')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [modalType, setModalType] = useState<'organization' | 'admin'>('organization')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    taxId: '',
    fullName: '',
    password: '',
    organizationId: '',
  })

  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalAdmins: 0,
  })

  // Mock data fetch
  useEffect(() => {
    fetchData()
  }, [])

   const fetchData = async () => {
     setLoading(true)
     try {
       // Fetch organizations from API
       const [orgsResponse, adminsResponse] = await Promise.all([
         api.get('/api/users/organizations').catch(() => ({ data: [] })),
         api.get('/api/users/by-role/ADMIN').catch(() => ({ data: [] })),
       ])

       const orgs = orgsResponse.data || []
       const adminsData = adminsResponse.data || []

       // Calculate stats from the data
       const activeOrgs = orgs.filter((o: any) => o.active).length
       const stats = {
         totalOrganizations: orgs.length,
         activeOrganizations: activeOrgs,
         totalAdmins: adminsData.length,
       }

       setOrganizations(orgs)
       setAdmins(adminsData)
       setStats(stats)
     } catch (error) {
       console.error('Error fetching data:', error)
       // Show fallback empty state
       setOrganizations([])
       setAdmins([])
       setStats({
         totalOrganizations: 0,
         activeOrganizations: 0,
         totalAdmins: 0,
       })
     } finally {
       setLoading(false)
     }
   }

  const handleCreateClick = (type: 'organization' | 'admin') => {
    setModalType(type)
    setShowCreateModal(true)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      taxId: '',
      fullName: '',
      password: '',
      organizationId: '',
    })
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (modalType === 'organization') {
        // Validate required fields
        if (!formData.name || !formData.email || !formData.city || !formData.country) {
          alert('Please fill in all required fields')
          setLoading(false)
          return
        }

        // Create organization via API
        await api.post('/api/users/organization/create', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          taxId: formData.taxId,
        })

        showCenteredSuccessModal({
          isOpen: true,
          title: 'Success!',
          message: `Organization "${formData.name}" created successfully!`,
          type: 'success',
          duration: 4000,
        })

        // Refresh data
        await fetchData()
      } else {
        // Create admin via API
        if (!formData.fullName || !formData.email || !formData.password || !formData.organizationId) {
          alert('Please fill in all required fields')
          setLoading(false)
          return
        }

        const selectedOrg = organizations.find((o) => o.id === parseInt(formData.organizationId))
        if (!selectedOrg) {
          alert('Please select a valid organization')
          setLoading(false)
          return
        }

        // Create the admin user with organization ID
        await api.post('/api/users/admin/create', {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          organizationId: parseInt(formData.organizationId),
        })

        showCenteredSuccessModal({
          isOpen: true,
          title: 'Success!',
          message: `Admin "${formData.fullName}" created successfully!`,
          type: 'success',
          duration: 4000,
        })

        // Refresh data
        await fetchData()
      }

      setShowCreateModal(false)
    } catch (error: any) {
      console.error('Error creating:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create'
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrganization = (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this organization?')) {
      setLoading(true)
      api
        .delete(`/api/users/organization/${id}`)
        .then(() => {
          setOrganizations(organizations.map((org) =>
            org.id === id ? { ...org, active: false } : org
          ))
          showCenteredSuccessModal({
            isOpen: true,
            title: 'Deactivated!',
            message: 'Organization deactivated successfully',
            type: 'success',
            duration: 4000,
          })
        })
        .catch((error) => {
          console.error('Error deactivating organization:', error)
          alert('Failed to deactivate organization')
        })
        .finally(() => setLoading(false))
    }
  }

  const handleDeleteAdmin = (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this admin?')) {
      setLoading(true)
      api
        .delete(`/api/users/${id}`)
        .then(() => {
          setAdmins(admins.map((admin) =>
            admin.id === id ? { ...admin, active: false } : admin
          ))
          showCenteredSuccessModal({
            isOpen: true,
            title: 'Deactivated!',
            message: 'Admin deactivated successfully',
            type: 'success',
            duration: 4000,
          })
        })
        .catch((error) => {
          console.error('Error deactivating admin:', error)
          alert('Failed to deactivate admin')
        })
        .finally(() => setLoading(false))
    }
  }

  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewOrganization = (orgId: number) => {
    navigate(`/organizations?orgId=${orgId}`)
  }

  const handleEditOrganization = (orgId: number) => {
    navigate(`/organizations?orgId=${orgId}&mode=edit`)
  }

  const handleViewAdmin = (adminId: number) => {
    navigate(`/user-management?userId=${adminId}`)
  }

  const handleEditAdmin = (adminId: number) => {
    navigate(`/user-management?userId=${adminId}&mode=edit`)
  }

  return (
    <div className="superadmin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">SuperAdmin Dashboard</h1>
          <p className="dashboard-subtitle">Manage gym organizations and administrators</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Building2 size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Organizations</h3>
            <p className="stat-value">{stats.totalOrganizations}</p>
            <span className="stat-label">{stats.activeOrganizations} active</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <h3>Total Admins</h3>
            <p className="stat-value">{stats.totalAdmins}</p>
            <span className="stat-label">All organizations</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <AlertCircle size={28} />
          </div>
          <div className="stat-content">
            <h3>System Status</h3>
            <p className="stat-value">Active</p>
            <span className="stat-label">All systems operational</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-section">
        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'organizations' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('organizations')
              setSearchTerm('')
            }}
          >
            <Building2 size={20} />
            Organizations
          </button>
          <button
            className={`tab-button ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admins')
              setSearchTerm('')
            }}
          >
            <Users size={20} />
            Administrators
          </button>
        </div>

        <button
          className="create-btn primary"
          onClick={() => handleCreateClick(activeTab === 'organizations' ? 'organization' : 'admin')}
        >
          <Plus size={20} />
          Create {activeTab === 'organizations' ? 'Organization' : 'Admin'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'organizations' ? 'organizations' : 'admins'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <Loader size={32} />
          <p>Loading data...</p>
        </div>
      ) : activeTab === 'organizations' ? (
        <div className="content-section">
          {filteredOrganizations.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} />
              <h3>No organizations found</h3>
              <p>Create your first gym organization to get started</p>
              <button className="create-btn" onClick={() => handleCreateClick('organization')}>
                <Plus size={20} />
                Create Organization
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id} className={org.active ? '' : 'inactive'}>
                      <td className="font-semibold">{org.name}</td>
                      <td>{org.email}</td>
                      <td>
                        {org.city}, {org.country}
                      </td>
                      <td>{org.phone}</td>
                      <td>
                        <span className={`status-badge ${org.active ? 'active' : 'inactive'}`}>
                          {org.active ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          {org.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(org.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button className="action-btn view" title="View details" onClick={() => handleViewOrganization(org.id)}>
                          <Eye size={18} />
                        </button>
                        <button className="action-btn edit" title="Edit" onClick={() => handleEditOrganization(org.id)}>
                          <Edit2 size={18} />
                        </button>
                        {org.active && (
                          <button
                            className="action-btn delete"
                            title="Deactivate"
                            onClick={() => handleDeleteOrganization(org.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          {filteredAdmins.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <h3>No admins found</h3>
              <p>Create an admin to manage an organization</p>
              <button className="create-btn" onClick={() => handleCreateClick('admin')}>
                <Plus size={20} />
                Create Admin
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Admin Name</th>
                    <th>Email</th>
                    <th>Organization</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin.id} className={admin.active ? '' : 'inactive'}>
                      <td className="font-semibold">{admin.fullName}</td>
                      <td>{admin.email}</td>
                      <td>{admin.organizationName}</td>
                      <td>
                        <span className="role-badge">{admin.role}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${admin.active ? 'active' : 'inactive'}`}>
                          {admin.active ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                          {admin.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn view" title="View details" onClick={() => handleViewAdmin(admin.id)}>
                          <Eye size={18} />
                        </button>
                        <button className="action-btn edit" title="Edit" onClick={() => handleEditAdmin(admin.id)}>
                          <Edit2 size={18} />
                        </button>
                        {admin.active && (
                          <button
                            className="action-btn delete"
                            title="Deactivate"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'organization' ? 'Create Organization' : 'Create Administrator'}
              </h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="modal-form">
              {modalType === 'organization' ? (
                <>
                  <div className="form-group">
                    <label>Organization Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="e.g., Gold Gym Downtown"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="contact@gym.com"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="+1-555-0100"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleFormChange}
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleFormChange}
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleFormChange}
                        placeholder="USA"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleFormChange}
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Tax ID</label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleFormChange}
                      placeholder="12-3456789"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Admin Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="john@gym.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="Enter secure password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Organization *</label>
                    <select
                      name="organizationId"
                      value={formData.organizationId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select an organization</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Create {modalType === 'organization' ? 'Organization' : 'Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

