import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, AlertCircle } from 'lucide-react'
import { membersService } from '../services/membersService'
import type { Member, UpdateMemberRequest } from '../types/members'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import '../styles/MemberEditPage.css'

export function MemberEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<UpdateMemberRequest>({
    fullName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  })

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return
      setLoading(true)
      try {
        const data = await membersService.getMember(parseInt(id))
        setMember(data)
        setFormData({
          fullName: data.fullName,
          email: data.email,
          mobile: data.mobile,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          notes: data.notes,
          status: data.status,
        })
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    if (!member?.id) return

    // Validate required fields
    if (!formData.fullName.trim()) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Full name is required',
        type: 'error',
        duration: 3000,
      })
      return
    }

    if (!formData.email.trim()) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Email is required',
        type: 'error',
        duration: 3000,
      })
      return
    }

    if (!formData.mobile.trim()) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Phone number is required',
        type: 'error',
        duration: 3000,
      })
      return
    }

    setSaving(true)
    try {
      await membersService.updateMember(member.id, formData)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Success',
        message: 'Member updated successfully',
        type: 'success',
        duration: 2000,
      })
      setTimeout(() => navigate(`/members/${member.id}`), 2000)
    } catch (error) {
      console.error('Error updating member:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to update member. Please try again.',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="member-edit-page role-dashboard-page">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading member details...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="member-edit-page role-dashboard-page">
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
    <div className="member-edit-page role-dashboard-page">
      <div className="page-header role-dashboard-header">
        <button className="back-btn" onClick={() => navigate(`/members/${member.id}`)} title="Go back">
          <ArrowLeft size={20} />
          Back
        </button>
        <div>
          <h1 className="page-title role-dashboard-title">Edit Member</h1>
          <p className="page-subtitle role-dashboard-subtitle">Update member profile</p>
        </div>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
          title="Save changes"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="member-edit-container">
        {/* Personal Information Form */}
        <div className="form-card role-dashboard-card">
          <div className="form-header">
            <h2>Personal Information</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="mobile">Phone *</label>
              <input
                id="mobile"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">Select status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
                <option value="EXPIRED">Expired</option>
                <option value="FROZEN">Frozen</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PENDING_PAYMENT">Pending Payment</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact Form */}
        <div className="form-card role-dashboard-card">
          <div className="form-header">
            <h2>Emergency Contact</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="emergencyContactName">Contact Name</label>
              <input
                id="emergencyContactName"
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Enter emergency contact name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="emergencyContactPhone">Contact Phone</label>
              <input
                id="emergencyContactPhone"
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="Enter emergency contact phone"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Notes Form */}
        <div className="form-card role-dashboard-card">
          <div className="form-header">
            <h2>Notes</h2>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes"
              className="form-input textarea"
              rows={4}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            onClick={() => navigate(`/members/${member.id}`)}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="save-btn primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

