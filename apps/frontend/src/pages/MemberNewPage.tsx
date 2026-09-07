import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { membersService } from '../services/membersService'
import type { CreateMemberRequest } from '../types/members'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import '../styles/MemberNewPage.css'

export function MemberNewPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<CreateMemberRequest>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
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
      const newMember = await membersService.createMember(formData)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Success',
        message: 'Member created successfully',
        type: 'success',
        duration: 2000,
      })
      setTimeout(() => navigate(`/members/${newMember.id}`), 2000)
    } catch (error) {
      console.error('Error creating member:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to create member. Please try again.',
        type: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="member-new-page role-dashboard-page">
      <div className="page-header role-dashboard-header">
        <button className="back-btn" onClick={() => navigate('/members')} title="Go back">
          <ArrowLeft size={20} />
          Back
        </button>
        <div>
          <h1 className="page-title role-dashboard-title">New Member Registration</h1>
          <p className="page-subtitle role-dashboard-subtitle">Create a new member profile</p>
        </div>
        <button
          className="save-btn"
          onClick={handleSave}
          disabled={saving}
          title="Save member"
        >
          <Save size={20} />
          {saving ? 'Creating...' : 'Create'}
        </button>
      </div>

      <div className="member-new-container">
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
            <h2>Additional Notes</h2>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
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
            onClick={() => navigate('/members')}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="save-btn primary"
          >
            {saving ? 'Creating...' : 'Create Member'}
          </button>
        </div>
      </div>
    </div>
  )
}

