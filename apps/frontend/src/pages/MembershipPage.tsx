import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Calendar, Users, Zap, Check, ArrowRight } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { membersService } from '../services/membersService'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { MembershipPlan, MembershipDetail } from '../types/fees'
import type { Member } from '../types/members'
import '../styles/MembershipPage.css'

export function MembershipPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab') === 'myMembership' ? 'myMembership' : 'plans'
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [memberships, setMemberships] = useState<MembershipDetail[]>([])
  const [memberId, setMemberId] = useState<number | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [assignableMembers, setAssignableMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [activeTab, setActiveTab] = useState<'plans' | 'myMembership'>(requestedTab)
  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [hasActiveMembership, setHasActiveMembership] = useState(false)
  const [replaceConfirmed, setReplaceConfirmed] = useState(false)
  const [activeMembershipPlanName, setActiveMembershipPlanName] = useState<string | null>(null)
  const [activeMembershipEndDate, setActiveMembershipEndDate] = useState<string | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<string[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [transactionId, setTransactionId] = useState('')
  const [processingEnrollment, setProcessingEnrollment] = useState(false)
  const [progressNow] = useState(() => Date.now())
  const requiresTransactionId = selectedPaymentMethod === 'CARD' || selectedPaymentMethod === 'UPI'
  const isStaffRole = Boolean(user && user.role !== 'USER')
  const requestedMemberId = Number(searchParams.get('memberId') || '') || null

  const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

  const getPlanPricingBreakdown = (plan: MembershipPlan) => {
    const planPrice = Number(plan.price) || 0
    const joiningFee = Number(plan.joiningFee) || 0
    const discountPercentage = Number(plan.discountPercentage) || 0
    const taxPercentage = Number(plan.taxPercentage) || 0
    const baseAmount = roundMoney(planPrice + joiningFee)
    const discountAmount = roundMoney(planPrice * (discountPercentage / 100))
    const taxableAmount = Math.max(0, roundMoney(baseAmount - discountAmount))
    const taxAmount = roundMoney(taxableAmount * (taxPercentage / 100))
    const totalAmount = roundMoney(taxableAmount + taxAmount)

    return {
      planPrice,
      joiningFee,
      discountPercentage,
      discountAmount,
      taxPercentage,
      taxAmount,
      baseAmount,
      totalAmount,
    }
  }

  const resetEnrollmentModal = () => {
    setShowEnrollModal(false)
    setSelectedPlan(null)
    setReplaceConfirmed(false)
    setHasActiveMembership(false)
    setActiveMembershipPlanName(null)
    setActiveMembershipEndDate(null)
    setTransactionId('')
    if (paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0])
    }
  }

  const fetchMembershipData = useCallback(async () => {
    setLoading(true)
    try {
      if (activeTab === 'plans') {
        const response = await api.get('/api/memberships/plans').catch(() => ({ data: null }))
        const payload = response.data?.data || response.data
        setPlans(Array.isArray(payload) ? payload : [])
      } else {
        if (isStaffRole && !selectedMember?.id) {
          setMemberships([])
          return
        }

        const response = isStaffRole
          ? await api.get(`/api/memberships/member/${selectedMember?.id}`).catch(() => ({ data: null }))
          : await api.get('/api/memberships/my').catch(() => ({ data: null }))
        const payload = response.data?.data || response.data
        const sourceMemberships = Array.isArray(payload) ? payload : payload ? [payload] : []
        const mappedMemberships = sourceMemberships.map((membership: any) => {
          const endDate = membership.endDate ? new Date(membership.endDate) : null
          const now = new Date()
          const msPerDay = 1000 * 60 * 60 * 24
          const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / msPerDay)) : 0

          return {
            id: membership.id,
            memberId: membership.memberId,
            memberName: membership.memberName,
            planId: membership.membershipPlanId,
            planName: membership.planName,
            startDate: membership.startDate,
            endDate: membership.endDate,
            status: membership.status,
            price: membership.price,
            discountAmount: membership.discountAmount,
            taxAmount: membership.taxAmount,
            totalAmount: membership.totalAmount,
            frozenUntil: membership.frozenUntil,
            freezeCount: membership.freezeCount || 0,
            daysRemaining,
          }
        })
        setMemberships(mappedMemberships)
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
  }, [activeTab, isStaffRole, selectedMember?.id])

  useEffect(() => {
    void fetchMembershipData()
  }, [fetchMembershipData])

  useEffect(() => {
    if (!isStaffRole) {
      return
    }

    const fetchAssignableMembers = async () => {
      setLoadingMembers(true)
      try {
        const response = await membersService.listMembers(0, 200, 'fullName', 'ASC')
        const fetchedMembers = Array.isArray(response.content) ? response.content : []
        setAssignableMembers(fetchedMembers)

        if (requestedMemberId) {
          const matchedMember = fetchedMembers.find((member) => member.id === requestedMemberId)
          if (matchedMember) {
            setSelectedMember(matchedMember)
            return
          }

          const resolvedMember = await membersService.getMember(requestedMemberId)
          setSelectedMember(resolvedMember)
          setAssignableMembers((current) => current.some((member) => member.id === resolvedMember.id)
            ? current
            : [resolvedMember, ...current])
        } else {
          setSelectedMember(null)
        }
      } catch (error) {
        console.error('Error fetching assignable members:', error)
        showCenteredSuccessModal({
          isOpen: true,
          title: 'Members Unavailable',
          message: 'Failed to load members for membership assignment.',
          type: 'error',
          duration: 4000,
        })
      } finally {
        setLoadingMembers(false)
      }
    }

    void fetchAssignableMembers()
  }, [isStaffRole, requestedMemberId])

  useEffect(() => {
    api.get('/api/payments/methods')
      .then((response) => {
        const methods = response.data?.data || response.data
        const normalized = Array.isArray(methods) ? methods : []
        setPaymentMethods(normalized)
        if (normalized.length > 0) {
          setSelectedPaymentMethod(normalized[0])
        }
      })
      .catch(() => {
        const fallbackMethods = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE', 'AUTO_RENEWAL']
        setPaymentMethods(fallbackMethods)
        setSelectedPaymentMethod(fallbackMethods[0])
      })
  }, [])

  const handleMemberSelection = (nextMemberId: string) => {
    const parsedMemberId = Number(nextMemberId) || null
    const params = new URLSearchParams(searchParams)

    if (!parsedMemberId) {
      params.delete('memberId')
      setSearchParams(params)
      setSelectedMember(null)
      setMemberships([])
      return
    }

    params.set('memberId', String(parsedMemberId))
    setSearchParams(params)
    const matchedMember = assignableMembers.find((member) => member.id === parsedMemberId) || null
    setSelectedMember(matchedMember)
  }

  const handleTabChange = (nextTab: 'plans' | 'myMembership') => {
    setActiveTab(nextTab)

    const params = new URLSearchParams(searchParams)
    params.set('tab', nextTab)
    setSearchParams(params)
  }

  const handleEnrollClick = async (plan: MembershipPlan) => {
    if (isStaffRole && !selectedMember) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Select Member First',
        message: 'Choose a member before assigning a membership plan.',
        type: 'error',
        duration: 3500,
      })
      return
    }

    let hasActive = memberships.some((membership) => membership.status === 'ACTIVE' || membership.status === 'EXPIRING_SOON')
    const localActiveMembership = memberships.find((membership) => membership.status === 'ACTIVE' || membership.status === 'EXPIRING_SOON')
    let currentPlanName = localActiveMembership?.planName || null
    let currentPlanEndDate = localActiveMembership?.endDate || null

    try {
      const response = isStaffRole && selectedMember?.id
        ? await api.get(`/api/memberships/member/${selectedMember.id}`).catch(() => ({ data: null }))
        : await api.get('/api/memberships/my').catch(() => ({ data: null }))
      const payload = response.data?.data || response.data
      const myMemberships = Array.isArray(payload) ? payload : payload ? [payload] : []
      const activeMembership = myMemberships.find((membership: any) => membership.status === 'ACTIVE' || membership.status === 'EXPIRING_SOON')
      hasActive = Boolean(activeMembership)
      currentPlanName = activeMembership?.planName || currentPlanName
      currentPlanEndDate = activeMembership?.endDate || currentPlanEndDate
    } catch {
      // Keep local fallback result.
    }

    setHasActiveMembership(hasActive)
    setActiveMembershipPlanName(currentPlanName)
    setActiveMembershipEndDate(currentPlanEndDate)
    setReplaceConfirmed(false)
    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0])
    }
    setTransactionId('')
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

  const handleUnfreezeMembership = async (membershipId: number) => {
    try {
      await api.post(`/api/memberships/${membershipId}/unfreeze`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Unfrozen Successfully!',
        message: 'Your membership has been unfrozen',
        type: 'success',
        duration: 4000,
      })
      fetchMembershipData()
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Unfreeze Failed',
        message: error instanceof Error ? error.message : 'Failed to unfreeze membership',
        type: 'error',
        duration: 4000,
      })
    }
  }

  const handleProceedToPayment = async () => {
    if (!selectedPlan) return

    if (hasActiveMembership && !replaceConfirmed) {
      setReplaceConfirmed(true)
      return
    }

    if (!selectedPaymentMethod) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Select Payment Method',
        message: 'Please choose a payment method to continue.',
        type: 'error',
        duration: 3500,
      })
      return
    }

    const normalizedTransactionId = transactionId.trim()
    if (requiresTransactionId && !normalizedTransactionId) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Transaction ID Required',
        message: `Please enter a transaction ID for ${selectedPaymentMethod} payment.`,
        type: 'error',
        duration: 3500,
      })
      return
    }

    setProcessingEnrollment(true)
    let createdMembershipId: number | null = null
    try {
      const pricing = getPlanPricingBreakdown(selectedPlan)
      let resolvedMemberId = isStaffRole ? selectedMember?.id ?? null : memberId
      if (!isStaffRole && !resolvedMemberId && user?.email) {
        const response = await api.get('/api/memberships/my/member')
        const member = response.data?.data || response.data
        resolvedMemberId = member?.id || null
        if (resolvedMemberId) {
          setMemberId(resolvedMemberId)
        }
      }

      if (!resolvedMemberId) {
        throw new Error(isStaffRole ? 'Please select a member to continue' : 'Member profile not found for your account')
      }

      const enrollmentTargetName = isStaffRole ? selectedMember?.fullName || 'selected member' : 'your account'

      const membershipResponse = await api.post('/api/memberships', {
        memberId: resolvedMemberId,
        membershipPlanId: selectedPlan.id,
        customPrice: pricing.baseAmount,
        discountAmount: pricing.discountAmount,
        taxAmount: pricing.taxAmount,
      })

      const createdMembership = membershipResponse.data?.data || membershipResponse.data
      createdMembershipId = Number(createdMembership?.id) || null
      const amount = Number(createdMembership?.price ?? pricing.baseAmount)
      const discountAmount = Number(createdMembership?.discountAmount ?? pricing.discountAmount)
      const taxAmount = Number(createdMembership?.taxAmount ?? pricing.taxAmount)
      const isPaymentConfirmed = selectedPaymentMethod === 'CASH' || requiresTransactionId

      await api.post('/api/payments', {
        memberId: resolvedMemberId,
        membershipId: createdMembership?.id,
        amount,
        discountPercentage: pricing.discountPercentage,
        discountAmount,
        taxPercentage: pricing.taxPercentage,
        taxAmount,
        paymentMethod: selectedPaymentMethod,
        ...(requiresTransactionId ? { transactionId: normalizedTransactionId } : {}),
        paymentReason: 'MEMBERSHIP_NEW',
        notes: isStaffRole
          ? `Membership ${selectedPlan.name} assigned to ${selectedMember?.fullName || `member ${resolvedMemberId}`}`
          : `Self-enrollment for ${selectedPlan.name}`,
      })

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Enrolled Successfully!',
        message: isPaymentConfirmed
          ? `${selectedPlan.name} has been enrolled for ${enrollmentTargetName}. Payment of ₹${pricing.totalAmount} was recorded via ${selectedPaymentMethod}.`
          : `${selectedPlan.name} has been enrolled for ${enrollmentTargetName}. Payment of ₹${pricing.totalAmount} was created with ${selectedPaymentMethod} and is pending confirmation.`,
        type: 'success',
        duration: 4000,
      })

      resetEnrollmentModal()
      handleTabChange('myMembership')
    } catch (error) {
      showCenteredSuccessModal({
        isOpen: true,
        title: createdMembershipId ? 'Payment Pending Attention' : 'Enrollment Failed',
        message: createdMembershipId
          ? 'Your plan enrollment was created, but the payment could not be recorded. Please check Payments or contact the front desk before retrying.'
          : error instanceof Error ? error.message : 'Failed to enroll in membership',
        type: 'error',
        duration: 5000,
      })
    } finally {
      setProcessingEnrollment(false)
    }
  }

  const calculateMonths = (days: number) => {
    return Math.floor(days / 30)
  }

  const hasPositive = (value: unknown): boolean => {
    const numeric = Number(value)
    return Number.isFinite(numeric) && numeric > 0
  }

  const selectedPlanPricing = selectedPlan ? getPlanPricingBreakdown(selectedPlan) : null

  const getMembershipProgress = (membership: MembershipDetail): number => {
    const start = new Date(membership.startDate).getTime()
    const end = new Date(membership.endDate).getTime()
    const now = progressNow
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0
    const elapsedPct = ((now - start) / (end - start)) * 100
    return Math.min(100, Math.max(0, Math.round(elapsedPct)))
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

  const canFreezeMembership = (status: MembershipDetail['status']) => {
    return status === 'ACTIVE' || status === 'EXPIRING_SOON'
  }

  const canUnfreezeMembership = (status: MembershipDetail['status']) => {
    return status === 'FROZEN'
  }

  return (
    <div className="membership-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Membership Plans</h1>
          <p className="page-subtitle">
            {isStaffRole
              ? 'Assign and manage membership plans for every member'
              : 'Choose the perfect plan for your fitness journey'}
          </p>
        </div>
      </div>

      {isStaffRole && (
        <div className="member-selection-panel">
          <div className="member-selection-copy">
            <h3>Select Member</h3>
            <p>Choose a member to assign a plan and review their current membership.</p>
          </div>
          <div className="member-selection-controls">
            <select
              className="member-selection-select"
              value={selectedMember?.id ?? ''}
              onChange={(event) => handleMemberSelection(event.target.value)}
              disabled={loadingMembers}
            >
              <option value="">{loadingMembers ? 'Loading members...' : 'Choose a member'}</option>
              {assignableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName} ({member.memberIdNumber})
                </option>
              ))}
            </select>

            {selectedMember && (
              <div className="selected-member-summary">
                <strong>{selectedMember.fullName}</strong>
                <span>{selectedMember.memberIdNumber} • {selectedMember.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="membership-tabs">
        <button
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => handleTabChange('plans')}
        >
          Available Plans
        </button>
        <button
          className={`tab-btn ${activeTab === 'myMembership' ? 'active' : ''}`}
          onClick={() => handleTabChange('myMembership')}
        >
          {isStaffRole ? 'Selected Member Membership' : 'My Membership'}
        </button>
      </div>

      {/* Tab Content */}
      <div className="membership-content">
        {activeTab === 'plans' && (
          <div className="plans-section">
            {/* Filter Info */}
            <div className="filter-info">
              <p>
                {isStaffRole
                  ? selectedMember
                    ? `Showing all active membership plans. Choose one to assign to ${selectedMember.fullName}.`
                    : 'Showing all active membership plans. Select a member first to assign a plan.'
                  : 'Showing all active membership plans. Choose one to get started!'}
              </p>
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
                      {hasPositive(plan.joiningFee) && (
                        <p className="joining-fee">+ ₹{plan.joiningFee} Joining Fee</p>
                      )}
                      {hasPositive(plan.discountPercentage) && (
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
                      {hasPositive(plan.maxPtSessions) && (
                        <div className="feature">
                          <Zap size={18} />
                          <span>{plan.maxPtSessions} PT Sessions</span>
                        </div>
                      )}
                      {hasPositive(plan.freezeAllowance) && (
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
                      disabled={isStaffRole && !selectedMember}
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
            ) : isStaffRole && !selectedMember ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>Select a Member</h3>
                <p>Choose a member above to view or assign their membership.</p>
                <button className="btn-explore" onClick={() => handleTabChange('plans')}>
                  View Plans
                  <ArrowRight size={18} />
                </button>
              </div>
            ) : memberships.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <h3>No Active Membership</h3>
                <p>
                  {isStaffRole && selectedMember
                    ? `${selectedMember.fullName} does not have an active membership yet. Explore plans and assign one now.`
                    : "You don't have any active membership yet. Explore our plans and enroll today!"}
                </p>
                <button className="btn-explore" onClick={() => handleTabChange('plans')}>
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
                          <span className="percentage">{getMembershipProgress(membership)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${getMembershipProgress(membership)}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Amount Info */}
                      <div className="amount-section">
                      <div className="info-row">
                        <label>Base Amount</label>
                        <span>₹{membership.price}</span>
                      </div>
                      {hasPositive(membership.discountAmount) && (
                        <div className="info-row discount">
                          <label>Discount</label>
                          <span>-₹{membership.discountAmount}</span>
                        </div>
                      )}
                      {hasPositive(membership.taxAmount) && (
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
                      {(membership.freezeCount > 0 || membership.status === 'FROZEN' || membership.frozenUntil) && (
                        <div className="freeze-info">
                          <label>{membership.status === 'FROZEN' ? 'Membership Frozen' : 'Freeze Used'}</label>
                          {membership.frozenUntil && membership.status === 'FROZEN' ? (
                            <span>Frozen until {new Date(membership.frozenUntil).toLocaleDateString()}</span>
                          ) : (
                            <span>{membership.freezeCount} freeze{membership.freezeCount === 1 ? '' : 's'} used</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="card-actions">
                      <button className="action-link" onClick={() => handleRenewMembership(membership.id)}>
                        Renew Membership
                      </button>
                      {canFreezeMembership(membership.status) && (
                        <button
                          className="action-link secondary"
                          onClick={() => handleFreezeMembership(membership.id)}
                        >
                          Freeze Membership
                        </button>
                      )}
                      {canUnfreezeMembership(membership.status) && (
                        <button
                          className="action-link secondary"
                          onClick={() => handleUnfreezeMembership(membership.id)}
                        >
                          Unfreeze Membership
                        </button>
                      )}
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
        <div className="modal-overlay" onClick={() => {
          if (!processingEnrollment) {
            resetEnrollmentModal()
          }
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>
              Enroll in {selectedPlan.name}
              {isStaffRole && selectedMember ? ` for ${selectedMember.fullName}` : ''}
            </h2>
            <div className="enroll-form">
              {isStaffRole && selectedMember && (
                <div className="selected-member-summary in-modal">
                  <strong>{selectedMember.fullName}</strong>
                  <span>{selectedMember.memberIdNumber} • {selectedMember.email}</span>
                </div>
              )}
              {hasActiveMembership && (
                <div className={`replace-warning ${replaceConfirmed ? 'confirmed' : ''}`}>
                  {replaceConfirmed
                    ? `Please confirm again. Your current active membership${activeMembershipPlanName ? ` (${activeMembershipPlanName})` : ''}${activeMembershipEndDate ? ` ending on ${new Date(activeMembershipEndDate).toLocaleDateString()}` : ''} will be replaced by this new plan.`
                    : `You already have an active membership${activeMembershipPlanName ? ` (${activeMembershipPlanName})` : ''}${activeMembershipEndDate ? ` ending on ${new Date(activeMembershipEndDate).toLocaleDateString()}` : ''}. Enrolling this plan will replace it.`}
                </div>
              )}
              <div className="plan-summary">
                <div className="summary-row">
                  <span>Base Plan</span>
                  <strong>₹{selectedPlanPricing?.planPrice ?? selectedPlan.price}</strong>
                </div>
                {hasPositive(selectedPlanPricing?.joiningFee) && (
                  <div className="summary-row">
                    <span>Joining Fee</span>
                    <strong>₹{selectedPlanPricing?.joiningFee}</strong>
                  </div>
                )}
                {hasPositive(selectedPlanPricing?.discountAmount) && (
                  <div className="summary-row discount">
                    <span>Discount ({selectedPlanPricing?.discountPercentage}%)</span>
                    <strong>-₹{selectedPlanPricing?.discountAmount}</strong>
                  </div>
                )}
                {hasPositive(selectedPlanPricing?.taxAmount) && (
                  <div className="summary-row">
                    <span>Tax ({selectedPlanPricing?.taxPercentage}%)</span>
                    <strong>₹{selectedPlanPricing?.taxAmount}</strong>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <strong>₹{selectedPlanPricing?.totalAmount}</strong>
                </div>
              </div>

              <div className="payment-method-section">
                <label htmlFor="payment-method" className="payment-method-label">Payment Method</label>
                <select
                  id="payment-method"
                  className="payment-method-select"
                  value={selectedPaymentMethod}
                  onChange={(event) => setSelectedPaymentMethod(event.target.value)}
                  disabled={processingEnrollment}
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {requiresTransactionId && (
                <div className="transaction-id-section">
                  <label htmlFor="transaction-id" className="payment-method-label">Transaction ID *</label>
                  <input
                    id="transaction-id"
                    type="text"
                    className="transaction-id-input"
                    placeholder={`Enter ${selectedPaymentMethod} transaction/reference ID`}
                    value={transactionId}
                    onChange={(event) => setTransactionId(event.target.value)}
                    disabled={processingEnrollment}
                  />
                  <small className="transaction-id-hint">Required for CARD and UPI payments.</small>
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-cancel" onClick={resetEnrollmentModal} disabled={processingEnrollment}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={handleProceedToPayment} disabled={processingEnrollment}>
                  {processingEnrollment
                    ? 'Processing...'
                    : hasActiveMembership && !replaceConfirmed
                      ? 'Continue'
                      : 'Pay & Enroll'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

