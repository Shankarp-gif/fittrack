import { useCallback, useEffect, useState } from 'react'
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import type { FeeRecord, FeeCollection, PaymentTransaction } from '../types/fees'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import '../styles/FeeCollectionPage.css'

export function FeeCollectionPage() {
  const [searchParams] = useSearchParams()
  const [feeCollection, setFeeCollection] = useState<FeeCollection | null>(null)
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'transactions'>(
    requestedTab === 'pending' ? 'pending' : 'overview'
  )
  const [loading, setLoading] = useState(false)
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'CHEQUE'>('CASH')
  const [transactionRef, setTransactionRef] = useState('')
  const requestedMemberId = Number(searchParams.get('memberId') || '')
  const requestedTab = searchParams.get('tab')

  const unwrapData = <T,>(payload: any): T => {
    return (payload?.data ?? payload) as T
  }

  const fetchFeeData = useCallback(async () => {
    setLoading(true)
    try {
      const [collectionResponse, paymentsResponse] = await Promise.all([
        api.get('/api/payments/collection-summary').catch(() => ({ data: null })),
        api.get('/api/payments?page=0&size=100').catch(() => ({ data: { content: [] } })),
      ])

      const collectionData = unwrapData<any>(collectionResponse.data)
      const collection: FeeCollection = collectionData ? {
        totalMembers: collectionData.totalMembers || 0,
        paidMembers: collectionData.totalPaidPayments || 0,
        pendingMembers: collectionData.totalPendingPayments || 0,
        overdueFees: collectionData.overdueMembers || 0,
        totalCollected: parseFloat(collectionData.totalCollected || 0),
        totalPending: parseFloat(collectionData.totalPending || 0),
        collectionPercentage: collectionData.collectionPercentage || 0,
      } : {
        totalMembers: 0,
        paidMembers: 0,
        pendingMembers: 0,
        overdueFees: 0,
        totalCollected: 0,
        totalPending: 0,
        collectionPercentage: 0,
      }

      const paymentsPayload = unwrapData<{ content?: any[] }>(paymentsResponse.data)
      const paymentsData = Array.isArray(paymentsPayload?.content) ? paymentsPayload.content : []
      const feeRecords: FeeRecord[] = paymentsData.map((p: any) => ({
        id: p.id,
        memberId: Number(p.memberId) || 0,
        memberName: p.memberName,
        amount: parseFloat(p.finalAmount || 0),
        status: p.paymentStatus,
        dueDate: p.createdAt,
        paidDate: p.paidAt,
        paymentMode: p.paymentMethod,
      }))

      const paidPayments = paymentsData.filter((p: any) => p.paymentStatus === 'PAID')
      const transactions: PaymentTransaction[] = paidPayments.map((p: any) => ({
        id: p.id,
        memberId: Number(p.memberId) || 0,
        memberName: p.memberName,
        amount: parseFloat(p.finalAmount || 0),
        paymentDate: p.paidAt || new Date().toISOString(),
        paymentMode: p.paymentMethod,
        referenceNo: p.referenceNumber || p.receiptNumber || 'N/A',
        status: 'SUCCESS',
      }))

      setFeeCollection(collection)
      setFeeRecords(feeRecords)
      setTransactions(transactions)
    } catch (error) {
      console.error('Error fetching fee data:', error)
      setFeeCollection({
        totalMembers: 0,
        paidMembers: 0,
        pendingMembers: 0,
        overdueFees: 0,
        totalCollected: 0,
        totalPending: 0,
        collectionPercentage: 0,
      })
      setFeeRecords([])
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchFeeData()
  }, [fetchFeeData])

  useEffect(() => {
    if (!Number.isFinite(requestedMemberId) || requestedMemberId <= 0 || feeRecords.length === 0) {
      return
    }

    const targetFee = feeRecords.find((fee) => fee.memberId === requestedMemberId && (fee.status === 'PENDING' || fee.status === 'OVERDUE'))
      || feeRecords.find((fee) => fee.memberId === requestedMemberId)

    if (targetFee) {
      setSelectedFee(targetFee)
      setPaymentAmount(targetFee.amount.toString())
      setSelectedPaymentMethod(targetFee.paymentMode || 'CASH')
      setTransactionRef('')
      setShowPaymentModal(true)
    }
  }, [requestedMemberId, feeRecords])

  const handlePayment = async () => {
    if (selectedFee && paymentAmount) {
      try {
        setLoading(true)
        const memberId = Number(selectedFee.memberId)
        const amount = parseFloat(paymentAmount)
        const normalizedTransactionRef = transactionRef.trim()
        const requiresTransactionId = selectedPaymentMethod === 'CARD' || selectedPaymentMethod === 'UPI'

        if (!Number.isFinite(memberId) || memberId <= 0) {
          showCenteredSuccessModal({
            isOpen: true,
            title: 'Invalid Member',
            message: 'Member ID not found. Please select a valid fee record.',
            type: 'error',
            duration: 2500,
          })
          setLoading(false)
          return
        }

        if (!Number.isFinite(amount) || amount <= 0) {
          showCenteredSuccessModal({
            isOpen: true,
            title: 'Invalid Amount',
            message: 'Please enter a valid payment amount.',
            type: 'warning',
            duration: 2200,
          })
          setLoading(false)
          return
        }

        if (requiresTransactionId && !normalizedTransactionRef) {
          showCenteredSuccessModal({
            isOpen: true,
            title: 'Reference Required',
            message: 'Transaction/reference ID is required for CARD and UPI payments.',
            type: 'warning',
            duration: 2600,
          })
          setLoading(false)
          return
        }

        const paymentRequest = {
          memberId,
          amount,
          paymentMethod: selectedPaymentMethod,
          paymentStatus: 'PAID',
          paymentReason: 'MEMBERSHIP_RENEWAL',
          ...(requiresTransactionId ? { transactionId: normalizedTransactionRef } : {}),
          ...(normalizedTransactionRef ? { referenceNumber: normalizedTransactionRef } : {}),
        }

        await api.post('/api/payments', paymentRequest)
        showCenteredSuccessModal({
          isOpen: true,
          title: 'Payment Successful',
          message: `Payment of ₹${paymentAmount} processed for ${selectedFee.memberName}`,
          type: 'success',
          duration: 2600,
        })
        setShowPaymentModal(false)
        setPaymentAmount('')
        setSelectedPaymentMethod('CASH')
        setTransactionRef('')
        setSelectedFee(null)
        // Refresh the fee data
        await fetchFeeData()
      } catch (error) {
        console.error('Error processing payment:', error)
        showCenteredSuccessModal({
          isOpen: true,
          title: 'Payment Failed',
          message: 'Error processing payment. Please try again.',
          type: 'error',
          duration: 2800,
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'paid'
      case 'PENDING':
        return 'pending'
      case 'OVERDUE':
        return 'overdue'
      case 'PARTIAL':
        return 'partial'
      default:
        return 'default'
    }
  }

  return (
    <div className="fee-collection-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Collection</h1>
          <p className="page-subtitle">Manage and track membership fees</p>
        </div>
      </div>

      {/* Collection Overview Cards */}
      {feeCollection && (
        <div className="collection-cards">
          <div className="collection-card primary">
            <div className="card-icon">
              <DollarSign size={28} />
            </div>
            <div className="card-content">
              <h3>Total Collected</h3>
              <p className="amount">₹{feeCollection.totalCollected.toLocaleString()}</p>
              <span className="card-badge">{feeCollection.paidMembers}/{feeCollection.totalMembers} Members</span>
            </div>
          </div>

          <div className="collection-card warning">
            <div className="card-icon">
              <Clock size={28} />
            </div>
            <div className="card-content">
              <h3>Pending Fees</h3>
              <p className="amount">₹{feeCollection.totalPending.toLocaleString()}</p>
              <span className="card-badge">{feeCollection.pendingMembers} Members</span>
            </div>
          </div>

          <div className="collection-card danger">
            <div className="card-icon">
              <AlertCircle size={28} />
            </div>
            <div className="card-content">
              <h3>Overdue Fees</h3>
              <p className="amount">{feeCollection.overdueFees}</p>
              <span className="card-badge">Members with overdue</span>
            </div>
          </div>

          <div className="collection-card success">
            <div className="card-icon">
              <CheckCircle size={28} />
            </div>
            <div className="card-content">
              <h3>Collection Rate</h3>
              <p className="amount">{feeCollection.collectionPercentage}%</p>
              <span className="card-badge">This month</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Fees
        </button>
        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Recent Transactions
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="table-container">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="loading">Loading...</td>
                  </tr>
                ) : feeRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">No fee records found</td>
                  </tr>
                ) : (
                  feeRecords.map((fee) => (
                    <tr key={fee.id}>
                      <td className="member-name">{fee.memberName}</td>
                      <td className="amount">₹{fee.amount.toLocaleString()}</td>
                      <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td>{fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : '-'}</td>
                      <td>
                        <span className={`fee-badge ${getStatusColor(fee.status)}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => {
                            setSelectedFee(fee)
                            setPaymentAmount(fee.amount.toString())
                            setSelectedPaymentMethod(fee.paymentMode || 'CASH')
                            setTransactionRef('')
                            setShowPaymentModal(true)
                          }}
                        >
                          <CreditCard size={16} />
                          Pay
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="table-container">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Days Pending</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feeRecords
                  .filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE')
                  .map((fee) => {
                    const dueDt = new Date(fee.dueDate)
                    const today = new Date()
                    const daysPending = Math.ceil(
                      (today.getTime() - dueDt.getTime()) / (1000 * 60 * 60 * 24)
                    )
                    return (
                      <tr key={fee.id}>
                        <td className="member-name">{fee.memberName}</td>
                        <td className="amount">₹{fee.amount.toLocaleString()}</td>
                        <td>{dueDt.toLocaleDateString()}</td>
                        <td className="days-pending">{daysPending} days</td>
                        <td>
                          <span className={`fee-badge ${getStatusColor(fee.status)}`}>
                            {fee.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="action-btn"
                            onClick={() => {
                              setSelectedFee(fee)
                              setPaymentAmount(fee.amount.toString())
                              setSelectedPaymentMethod(fee.paymentMode || 'CASH')
                              setTransactionRef('')
                              setShowPaymentModal(true)
                            }}
                          >
                            <CreditCard size={16} />
                            Collect
                          </button>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="table-container">
            <table className="fee-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Mode</th>
                  <th>Reference No</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="loading">Loading...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty">No transactions found</td>
                  </tr>
                ) : (
                  transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td className="member-name">{txn.memberName}</td>
                      <td className="amount">₹{txn.amount.toLocaleString()}</td>
                      <td>{new Date(txn.paymentDate).toLocaleDateString()}</td>
                      <td>
                        <span className="mode-badge">{txn.paymentMode}</span>
                      </td>
                      <td className="ref-no">{txn.referenceNo}</td>
                      <td>
                        <span className="txn-badge success">{txn.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Process Payment</h2>
            <div className="payment-form">
              <div className="form-group">
                <label>Member Name</label>
                <input type="text" value={selectedFee.memberName} disabled />
              </div>

              <div className="form-group">
                <label>Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div className="form-group">
                <label>Payment Mode</label>
                <select value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value as 'CASH' | 'UPI' | 'CARD' | 'CHEQUE')}>
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">CARD</option>
                  <option value="CHEQUE">CHEQUE</option>
                </select>
              </div>

              {(selectedPaymentMethod === 'UPI' || selectedPaymentMethod === 'CARD') ? (
                <div className="form-group">
                  <label>Transaction / Reference ID</label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder={`Enter ${selectedPaymentMethod} reference`}
                  />
                </div>
              ) : null}

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button className="btn-confirm" onClick={handlePayment}>
                  Process Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

