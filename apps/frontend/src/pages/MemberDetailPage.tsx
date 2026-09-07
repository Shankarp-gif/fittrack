import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, AlertCircle, Edit2, CreditCard } from 'lucide-react'
import { membersService } from '../services/membersService'
import type { Member } from '../types/members'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import '../styles/MemberDetailPage.css'

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await membersService.getMember(parseInt(id))
        setMember(data)
      } catch (error) {
        console.error('Error fetching member:', error)
        showCenteredSuccessModal({
          isOpen: true,
          title: 'Error',
          message: 'Failed to load member details. Please try again.',
          type: 'error',
          duration: 3000,
        })
        setTimeout(() => navigate('/members'), 2000)
      } finally {
        setLoading(false)
      }
    }

    fetchMember()
  }, [id, navigate])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
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

  const handleAssignMembership = () => {
    if (!member) return
    navigate(`/membership-plans?memberId=${member.id}`)
  }

  if (loading) {
    return (
      <div className="member-detail-page role-dashboard-page">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading member details...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="member-detail-page role-dashboard-page">
        <div className="empty-state">
          <AlertCircle size={48} />
          <p>Member not found</p>
          <button onClick={() => navigate('/members')} className="action-btn">
            Back to Members
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="member-detail-page role-dashboard-page">
      <div className="page-header role-dashboard-header">
        <button className="back-btn" onClick={() => navigate('/members')} title="Go back">
          <ArrowLeft size={20} />
          Back
        </button>
        <div>
          <h1 className="page-title role-dashboard-title">Member Details</h1>
          <p className="page-subtitle role-dashboard-subtitle">View complete member profile</p>
        </div>
        <div className="page-header-actions">
          <button
            className="edit-btn"
            onClick={handleAssignMembership}
            title="Assign membership"
          >
            <CreditCard size={20} />
            Membership
          </button>
          <button
            className="edit-btn"
            onClick={() => navigate(`/members/${member.id}/edit`)}
            title="Edit member"
          >
            <Edit2 size={20} />
            Edit
          </button>
        </div>
      </div>

      <div className="member-detail-container">
        {/* Main Info Card */}
        <div className="detail-card role-dashboard-card">
          <div className="card-header">
            <h2>Personal Information</h2>
            <span className={`status-badge ${getStatusColor(member.status)}`}>
              {member.status}
            </span>
          </div>

          <div className="detail-grid">
            <div className="detail-group">
              <label>Member ID</label>
              <div className="detail-value">{member.memberIdNumber}</div>
            </div>
            <div className="detail-group">
              <label>Full Name</label>
              <div className="detail-value flex-items">
                <User size={18} />
                {member.fullName}
              </div>
            </div>
            <div className="detail-group">
              <label>Email</label>
              <div className="detail-value flex-items">
                <Mail size={18} />
                <a href={`mailto:${member.email}`}>{member.email}</a>
              </div>
            </div>
            <div className="detail-group">
              <label>Phone</label>
              <div className="detail-value flex-items">
                <Phone size={18} />
                <a href={`tel:${member.mobile}`}>{member.mobile}</a>
              </div>
            </div>
            <div className="detail-group">
              <label>Date of Birth</label>
              <div className="detail-value flex-items">
                <Calendar size={18} />
                {formatDate(member.dateOfBirth)}
              </div>
            </div>
            <div className="detail-group">
              <label>Gender</label>
              <div className="detail-value">{member.gender}</div>
            </div>
            <div className="detail-group full-width">
              <label>Address</label>
              <div className="detail-value flex-items">
                <MapPin size={18} />
                {member.address}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="detail-card role-dashboard-card">
          <div className="card-header">
            <h2>Emergency Contact</h2>
          </div>

          <div className="detail-grid">
            <div className="detail-group">
              <label>Contact Name</label>
              <div className="detail-value">{member.emergencyContactName}</div>
            </div>
            <div className="detail-group">
              <label>Contact Phone</label>
              <div className="detail-value flex-items">
                <Phone size={18} />
                <a href={`tel:${member.emergencyContactPhone}`}>{member.emergencyContactPhone}</a>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Card */}
        {member.notes && (
          <div className="detail-card role-dashboard-card">
            <div className="card-header">
              <h2>Notes</h2>
            </div>
            <p className="notes-content">{member.notes}</p>
          </div>
        )}

        {/* Dates Card */}
        <div className="detail-card role-dashboard-card">
          <div className="card-header">
            <h2>Membership Dates</h2>
          </div>

          <div className="detail-grid">
            <div className="detail-group">
              <label>Joined Date</label>
              <div className="detail-value">{formatDate(member.createdAt)}</div>
            </div>
            <div className="detail-group">
              <label>Last Updated</label>
              <div className="detail-value">{formatDate(member.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

