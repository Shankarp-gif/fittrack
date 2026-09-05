import { useState, useEffect } from 'react'
import { Calendar, Users, Zap, Check, ArrowRight } from 'lucide-react'
import { api } from '../services/api'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { MembershipPlan, MembershipDetail } from '../types/fees'
import '../styles/MembershipPage.css'

export function MembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [memberships, setMemberships] = useState<MembershipDetail[]>([])
  const [activeTab, setActiveTab] = useState<'plans' | 'myMembership'>('plans')
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  useEffect(() => {
    fetchMembershipData()
  }, [activeTab])

  const fetchMembershipData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'plans') {
        const response = await api.get('/api/membership-plans').catch(() => ({ data: [] }))
        setPlans(response.data || [])
      } else {
        const response = await api.get('/api/my-memberships').catch(() => ({ data: [] }))
        setMemberships(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching membership data:', error)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error Loading Data',
        message: error instanceof Error ? error.message : 'Failed to load membership data',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollClick = (plan: MembershipPlan) => {
    setSelectedPlan(plan)
    setShowEnrollModal(true)
  }

  const handleRenewMembership = async (membershipId: number) => {
    try {
      await api.post(`/api/memberships/${membershipId}/renew`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Renewed Successfully!',
        message: 'Your membership has been renewed',
        type: 'success',
        duration: 4000,
      })
      fetchMembershipData()
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Renewal Failed',
        message: error instanceof Error ? error.message : 'Failed to renew membership',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const handleFreezeMembership = async (membershipId: number) => {
    try {
      await api.post(`/api/memberships/${membershipId}/freeze`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Frozen Successfully!',
        message: 'Your membership has been frozen',
        type: 'success',
        duration: 4000,
      })
      fetchMembershipData()
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Freeze Failed',
        message: error instanceof Error ? error.message : 'Failed to freeze membership',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return

    try {
      await api.post('/api/memberships/enroll', {
        planId: selectedPlan.id,
      })

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Enrolled Successfully!',
        message: `You have enrolled in ${selectedPlan.name}`,
        type: 'success',
        duration: 4000,
      })

      setShowEnrollModal(false)
      setSelectedPlan(null)
      fetchMembershipData()
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Enrollment Failed',
        message: error instanceof Error ? error.message : 'Failed to enroll in membership',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const calculateMonths = (days: number) => {
    return Math.floor(days / 30)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'active'
      case 'EXPIRING_SOON':
        return 'warning'
      case 'EXPIRED':
        return 'expired'
      case 'FROZEN':
        return 'frozen'
      default:
        return 'default'
    }
  }

  return (
    <div className="membership-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p className="page-subtitle">Choose the perfect plan for your fitness journey</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="membership-tabs">
        <button
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Available Plans
        </button>
        <button
          className={`tab-btn ${activeTab === 'myMembership' ? 'active' : ''}`}
          onClick={() => setActiveTab('myMembership')}
        >
          My Membership
        </button>
      </div>

      {/* Tab Content */}
      <div className="membership-content">
        {activeTab === 'plans' && (
          <div className="plans-section">
            {/* Filter Info */}
            <div className="filter-info">
              <p>Showing all active membership plans. Choose one to get started!</p>
            </div>

            {/* Plans Grid */}
            {loading ? (
              <div className="loading-state">Loading plans...</div>
            ) : (
              <div className="plans-grid">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${plan.durationDays >= 365 ? 'premium' : ''}`}
                  >
                    {/* Badge */}
                    {plan.durationDays === 30 && <span className="popular-badge">Popular</span>}
                    {plan.durationDays === 365 && <span className="best-badge">Best Value</span>}

                    {/* Plan Header */}
                    <div className="plan-header">
                      <h3 className="plan-name">{plan.name}</h3>
                      <p className="plan-description">{plan.description}</p>
                    </div>

                    {/* Duration Info */}
                    <div className="duration-info">
                      <div className="duration-item">
                        <Calendar size={18} />
                        <span>{plan.durationDays} Days</span>
                      </div>
                      {plan.durationDays >= 30 && (
                        <div className="duration-item">
                          <span className="month-info">
                            ≈ {calculateMonths(plan.durationDays)} Month{calculateMonths(plan.durationDays) > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="price-section">
                      <div className="price-main">
                        <span className="currency">₹</span>
                        <span className="amount">{plan.price}</span>
                        <span className="period">/plan</span>
                      </div>
                      {plan.joiningFee && plan.joiningFee > 0 && (
                        <p className="joining-fee">+ ₹{plan.joiningFee} Joining Fee</p>
                      )}
                      {plan.discountPercentage && plan.discountPercentage > 0 && (
                        <p className="discount">
                          <span className="discount-badge">Save {plan.discountPercentage}%</span>
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="features-list">
                      <div className="feature">
                        <Check size={18} />
                        <span>Full Gym Access</span>
                      </div>
                      {plan.maxPtSessions && plan.maxPtSessions > 0 && (
                        <div className="feature">
                          <Zap size={18} />
                          <span>{plan.maxPtSessions} PT Sessions</span>
                        </div>
                      )}
                      {plan.freezeAllowance && plan.freezeAllowance > 0 && (
                        <div className="feature">
                          <Zap size={18} />
                          <span>{plan.freezeAllowance} Freeze Allowance</span>
                        </div>
                      )}
                      <div className="feature">
                        <Check size={18} />
                        <span>24/7 Access</span>
                      </div>
                      <div className="feature">
                        <Check size={18} />
                        <span>Progress Tracking</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      className="enroll-btn"
                      onClick={() => handleEnrollClick(plan)}
                    >
                      Enroll Now
                      <ArrowRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'myMembership' && (
          <div className="my-membership-section">
            {loading ? (
              <div className="loading-state">Loading membership details...</div>
            ) : memberships.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No Active Membership</h3>
                <p>You don't have any active membership yet. Explore our plans and enroll today!</p>
                <button className="btn-explore" onClick={() => setActiveTab('plans')}>
                  Explore Plans
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className="memberships-grid">
                {memberships.map((membership) => (
                  <div key={membership.id} className="membership-card">
                    <div className="card-header">
                      <h3>{membership.planName}</h3>
                      <span className={`status-badge ${getStatusColor(membership.status)}`}>
                        {membership.status}
                      </span>
                    </div>

                    <div className="card-body">
                      {/* Dates */}
                      <div className="info-row">
                        <label>Start Date</label>
                        <span>{new Date(membership.startDate).toLocaleDateString()}</span>
                      </div>

                      <div className="info-row">
                        <label>End Date</label>
                        <span>{new Date(membership.endDate).toLocaleDateString()}</span>
                      </div>

                      <div className="info-row">
                        <label>Days Remaining</label>
                        <span className="days-remaining">
                          {membership.daysRemaining} days
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="progress-section">
                        <div className="progress-label">
                          <span>Membership Progress</span>
                          <span className="percentage">
                            {Math.round(
                              ((new Date(membership.endDate).getTime() - new Date().getTime()) /
                                (new Date(membership.endDate).getTime() - new Date(membership.startDate).getTime())) *
                                100
                            )}%
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.round(
                                ((new Date(membership.endDate).getTime() - new Date().getTime()) /
                                  (new Date(membership.endDate).getTime() - new Date(membership.startDate).getTime())) *
                                  100
                              )}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Amount Info */}
                      <div className="amount-section">
                      <div className="info-row">
                        <label>Plan Price</label>
                        <span>₹{membership.price}</span>
                      </div>
                      {membership.discountAmount && (
                        <div className="info-row discount">
                          <label>Discount</label>
                          <span>-₹{membership.discountAmount}</span>
                        </div>
                      )}
                      {membership.taxAmount && (
                        <div className="info-row">
                          <label>Tax</label>
                          <span>₹{membership.taxAmount}</span>
                        </div>
                      )}
                        <div className="amount-row total">
                          <label>Total Amount</label>
                          <span>₹{membership.totalAmount}</span>
                        </div>
                      </div>

                      {/* Freeze Info */}
                      {membership.freezeCount > 0 && (
                        <div className="freeze-info">
                          <label>Freeze Used</label>
                          <span>{membership.freezeCount} / {membership.freezeCount + 1} freezes available</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="card-actions">
                      <button className="action-link" onClick={() => handleRenewMembership(membership.id)}>
                        Renew Membership
                      </button>
                      <button
                        className="action-link secondary"
                        onClick={() => handleFreezeMembership(membership.id)}
                        disabled={membership.freezeCount >= 1}
                      >
                        {membership.freezeCount >= 1 ? 'No Freezes Available' : 'Freeze Membership'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enroll Modal */}
      {showEnrollModal && selectedPlan && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Enroll in {selectedPlan.name}</h2>
            <div className="enroll-form">
              <div className="plan-summary">
                <div className="summary-row">
                  <span>Plan Price</span>
                  <strong>₹{selectedPlan.price}</strong>
                </div>
                {selectedPlan.joiningFee && selectedPlan.joiningFee > 0 && (
                  <div className="summary-row">
                    <span>Joining Fee</span>
                    <strong>₹{selectedPlan.joiningFee}</strong>
                  </div>
                )}
                {selectedPlan.discountPercentage && selectedPlan.discountPercentage > 0 && (
                  <div className="summary-row discount">
                    <span>Discount ({selectedPlan.discountPercentage}%)</span>
                    <strong>
                      -₹{Math.round((selectedPlan.price * selectedPlan.discountPercentage) / 100)}
                    </strong>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <strong>
                    ₹{Math.round(
                      selectedPlan.price +
                        (selectedPlan.joiningFee || 0) -
                        (selectedPlan.discountPercentage ? (selectedPlan.price * selectedPlan.discountPercentage) / 100 : 0)
                    )}
                  </strong>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowEnrollModal(false)}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={handleProceedToPayment}>
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

