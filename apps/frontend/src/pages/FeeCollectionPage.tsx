import { useState, useEffect } from 'react'
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import type { FeeRecord, FeeCollection, PaymentTransaction } from '../types/fees'
import '../styles/FeeCollectionPage.css'

export function FeeCollectionPage() {
  const [feeCollection, setFeeCollection] = useState<FeeCollection | null>(null)
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'transactions'>('overview')
  const [loading, setLoading] = useState(false)
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockCollection: FeeCollection = {
        totalMembers: 50,
        paidMembers: 45,
        pendingMembers: 5,
        overdueFees: 2,
        totalCollected: 225000,
        totalPending: 25000,
        collectionPercentage: 90
      }

      const mockFees: FeeRecord[] = [
        {
          id: 1,
          memberId: 1,
          memberName: 'John Doe',
          amount: 5000,
          dueDate: '2026-09-01',
          paidDate: '2026-09-01',
          status: 'PAID',
          paymentMode: 'UPI',
          remarks: 'Paid on time'
        },
        {
          id: 2,
          memberId: 2,
          memberName: 'Jane Smith',
          amount: 5000,
          dueDate: '2026-09-05',
          status: 'PENDING',
          paymentMode: undefined,
          remarks: 'Awaiting payment'
        },
        {
          id: 3,
          memberId: 3,
          memberName: 'Mike Johnson',
          amount: 5000,
          dueDate: '2026-08-25',
          status: 'OVERDUE',
          paymentMode: undefined,
          remarks: '5 days overdue'
        }
      ]

      const mockTransactions: PaymentTransaction[] = [
        {
          id: 1,
          memberId: 1,
          memberName: 'John Doe',
          amount: 5000,
          paymentDate: '2026-09-01',
          paymentMode: 'UPI',
          referenceNo: 'TXN001234567',
          status: 'SUCCESS'
        },
        {
          id: 2,
          memberId: 4,
          memberName: 'Sarah Williams',
          amount: 5000,
          paymentDate: '2026-09-04',
          paymentMode: 'CARD',
          referenceNo: 'TXN001234568',
          status: 'SUCCESS'
        }
      ]

      setFeeCollection(mockCollection)
      setFeeRecords(mockFees)
      setTransactions(mockTransactions)
      setLoading(false)
    }, 500)
  }, [])

  const handlePayment = () => {
    if (selectedFee && paymentAmount) {
      alert(`Payment of ₹${paymentAmount} processed for ${selectedFee.memberName}`)
      setShowPaymentModal(false)
      setPaymentAmount('')
      setSelectedFee(null)
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
                <select>
                  <option>Select Payment Mode</option>
                  <option>CASH</option>
                  <option>UPI</option>
                  <option>CARD</option>
                  <option>CHEQUE</option>
                </select>
              </div>

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

