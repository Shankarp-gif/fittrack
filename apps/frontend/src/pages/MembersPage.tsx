import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { membersService } from '../services/membersService'
import type { Member } from '../types/members'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import '../styles/MembersPage.css'

export function MembersPage() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [sortBy, setSortBy] = useState('id')
  const [sortDir, setSortDir] = useState('DESC')

  useEffect(() => {
    fetchMembers()
  }, [currentPage, pageSize, sortBy, sortDir])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const response = searchQuery
        ? await membersService.searchMembers(searchQuery, currentPage, pageSize)
        : await membersService.listMembers(currentPage, pageSize, sortBy, sortDir)

      setMembers(response.content || [])
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error('Error fetching members:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load members. Please try again.',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    fetchMembers()
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return

    try {
      await membersService.deleteMember(id)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Success',
        message: 'Member deleted successfully',
        type: 'success',
        duration: 2000,
      })
      fetchMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to delete member',
        type: 'error',
        duration: 3000,
      })
    }
  }

  const handleAddMember = () => {
    navigate('/members/new')
  }

  const handleViewMember = (memberId: number) => {
    // Navigate to member detail view
    // For now, we'll navigate to members/new with member ID
    // In future, this could navigate to /members/:id for a detailed view
    navigate(`/members/${memberId}`)
  }

  const handleEditMember = (memberId: number) => {
    // Navigate to member edit page
    navigate(`/members/${memberId}/edit`)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active'
      case 'EXPIRING_SOON':
        return 'status-expiring'
      case 'EXPIRED':
        return 'status-expired'
      case 'FROZEN':
        return 'status-frozen'
      case 'CANCELLED':
        return 'status-cancelled'
      case 'PENDING_PAYMENT':
        return 'status-pending'
      default:
        return 'status-default'
    }
  }

  return (
    <div className="members-page role-dashboard-page">
      <div className="page-header role-dashboard-header members-header-card role-dashboard-card">
        <div>
          <h1 className="page-title role-dashboard-title">Members Management</h1>
          <p className="page-subtitle role-dashboard-subtitle">
            View, search, and manage gym members
          </p>
        </div>
        <button className="add-btn" onClick={handleAddMember}>
          <Plus size={20} />
          New Member
        </button>
      </div>

      <div className="filter-section role-dashboard-card">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">
            Search
          </button>
        </div>

        <div className="filter-options">
          <div className="sort-group">
            <label htmlFor="sort-by">Sort By:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setCurrentPage(0)
              }}
              className="sort-select"
            >
              <option value="id">ID</option>
              <option value="fullName">Name</option>
              <option value="createdAt">Date Created</option>
            </select>
          </div>
          <div className="sort-group">
            <label htmlFor="sort-dir">Direction:</label>
            <select
              id="sort-dir"
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value)
                setCurrentPage(0)
              }}
              className="sort-select"
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="members-list-card role-dashboard-card">
        <div className="table-header">
          <h3>Members List</h3>
          <span className="total-count">Total: {totalElements}</span>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <p>No members found</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="members-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="table-row">
                      <td className="id-cell">{member.memberIdNumber}</td>
                      <td className="name-cell">{member.fullName}</td>
                      <td className="email-cell">{member.email}</td>
                      <td className="phone-cell">{member.mobile}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td>{formatDate(member.createdAt)}</td>
                       <td className="actions-cell">
                         <button
                           className="action-btn view-btn"
                           title="View Details"
                           onClick={() => handleViewMember(member.id)}
                         >
                           <Eye size={16} />
                         </button>
                         <button
                           className="action-btn edit-btn"
                           title="Edit"
                           onClick={() => handleEditMember(member.id)}
                         >
                           <Edit2 size={16} />
                         </button>
                         <button
                           className="action-btn delete-btn"
                           title="Delete"
                           onClick={() => handleDelete(member.id)}
                         >
                           <Trash2 size={16} />
                         </button>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-container">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                Previous
              </button>

              <div className="page-info">
                Page {currentPage + 1} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
              >
                Next
              </button>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(parseInt(e.target.value))
                  setCurrentPage(0)
                }}
                className="page-size-select"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

