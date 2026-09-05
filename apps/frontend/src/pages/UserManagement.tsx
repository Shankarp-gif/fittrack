import { useState, useEffect } from 'react'
import { Users, Edit2, Trash2, Save, X } from 'lucide-react'
import '../styles/UserManagement.css'

interface User {
  id: number
  fullName: string
  email: string
  role: 'ADMIN' | 'TRAINER' | 'RECEPTIONIST' | 'USER'
  active: boolean
  createdAt: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeRole = async (userId: number) => {
    if (!newRole) return

    try {
      const response = await fetch('/api/users/change-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          userId: userId,
          newRole: newRole,
        }),
      })

      if (response.ok) {
        fetchUsers()
        setEditingId(null)
        setNewRole('')
      }
    } catch (error) {
      console.error('Error changing role:', error)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = !filterRole || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
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

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={32} style={{ marginRight: '12px' }} />
            User Management
          </h1>
          <p className="page-subtitle">Manage user roles and permissions</p>
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

      {/* Filters */}
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
          onChange={(e) => setFilterRole(e.target.value)}
          className="filter-select"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="TRAINER">Trainer</option>
          <option value="RECEPTIONIST">Receptionist</option>
          <option value="USER">Member</option>
        </select>
        <span className="filter-result">{filteredUsers.length} users found</span>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading">Loading users...</div>
      ) : (
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
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`user-row ${!user.active ? 'inactive' : ''}`}>
                    <td className="user-name">
                      <strong>{user.fullName}</strong>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td className="user-role">
                      {editingId === user.id ? (
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="role-select-edit"
                        >
                          <option value="">Select Role</option>
                          <option value="ADMIN">Admin</option>
                          <option value="TRAINER">Trainer</option>
                          <option value="RECEPTIONIST">Receptionist</option>
                          <option value="USER">Member</option>
                        </select>
                      ) : (
                        <span className={`role-badge ${getRoleColor(user.role)}`}>
                          {user.role === 'USER' ? 'Member' : user.role}
                        </span>
                      )}
                    </td>
                    <td className="user-status">
                      <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                        {user.active ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                    <td className="user-joined">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="user-actions">
                      {editingId === user.id ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={() => handleChangeRole(user.id)}
                            title="Save"
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
                              setEditingId(user.id)
                              setNewRole(user.role)
                            }}
                            title="Edit Role"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDeleteUser(user.id)}
                            title="Delete"
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

      {/* Stats by Role */}
      <div className="role-stats">
        <div className="role-stat-card admin">
          <h3>Admins</h3>
          <p className="count">{users.filter((u) => u.role === 'ADMIN').length}</p>
        </div>
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
    </div>
  )
}

