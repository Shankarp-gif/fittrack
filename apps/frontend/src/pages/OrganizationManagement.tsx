import { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus, X, Check, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import '../styles/OrganizationManagement.css'

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

interface Category {
  id: number
  name: string
  description: string
  active: boolean
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

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState<CreateOrgRequest>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('name')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    fetchOrganizations()
    fetchCategories()
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/organization-categories').catch(() => ({ data: [] }))
      setCategories(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.log('Categories not available yet')
    }
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

  const filteredOrgs = organizations
    .filter((org) => {
      if (filterActive === 'active') return org.active
      if (filterActive === 'inactive') return !org.active
      return true
    })
    .filter((org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.city.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    })

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'N/A'
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || 'N/A'
  }

  return (
    <div className="org-management-container">
      <section className="panel org-header">
        <div className="header-content">
          <div>
            <h1>🏢 Organization Management</h1>
            <p className="muted">Create, edit, and manage gym organizations</p>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="primary-btn">
            <Plus size={18} /> Add Organization
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="panel filters-panel">
        <div className="filters-row">
          <div className="search-group">
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value as any)} className="filter-select">
            <option value="all">All</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="filter-select">
            <option value="name">Sort by Name</option>
            <option value="createdAt">Sort by Created Date</option>
          </select>

          <button onClick={fetchOrganizations} className="secondary-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </section>

      {/* Organizations Table */}
      <section className="panel orgs-table-panel">
        <h2>Organizations ({filteredOrgs.length})</h2>

        {loading ? (
          <p className="muted">Loading organizations...</p>
        ) : filteredOrgs.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>No organizations found</p>
            <button onClick={() => setShowCreateModal(true)} className="primary-btn">
              Create First Organization
            </button>
          </div>
        ) : (
          <table className="orgs-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>City</th>
                <th>Category</th>
                <th>Members</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.map((org) => (
                <tr key={org.id} className={!org.active ? 'inactive-row' : ''}>
                  <td>
                    <strong>{org.name}</strong>
                  </td>
                  <td>{org.email}</td>
                  <td>{org.city}</td>
                  <td>
                    <span className="badge">{getCategoryName(org.categoryId)}</span>
                  </td>
                  <td>{org.memberCapacity || 'N/A'}</td>
                  <td>{org.establishmentYear || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${org.active ? 'active' : 'inactive'}`}>
                      {org.active ? '✓ Active' : '✕ Inactive'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => handleEdit(org)} className="icon-btn edit" title="Edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(org.id)} className="icon-btn delete" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) || undefined })}
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Establishment Year</label>
                  <input
                    type="number"
                    value={formData.establishmentYear || ''}
                    onChange={(e) => setFormData({ ...formData, establishmentYear: parseInt(e.target.value) || undefined })}
                    className="form-input"
                    placeholder="2015"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Member Capacity</label>
                  <input
                    type="number"
                    value={formData.memberCapacity || ''}
                    onChange={(e) => setFormData({ ...formData, memberCapacity: parseInt(e.target.value) || undefined })}
                    className="form-input"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label>Facilities</label>
                  <textarea
                    value={formData.facilities || ''}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                    className="form-input"
                    placeholder="List facilities (e.g., Gym equipment, Pool, Yoga studio)"
                    rows={3}
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

