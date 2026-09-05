/* Fee and Payment Types */
export interface FeeRecord {
  id: number
  memberId: number
  memberName: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL'
  paymentMode?: 'CASH' | 'CARD' | 'UPI' | 'CHEQUE'
  remarks?: string
}

export interface MembershipPlan {
  id: number
  name: string
  description?: string
  durationDays: number
  price: number
  joiningFee?: number
  discountPercentage?: number
  taxPercentage?: number
  maxPtSessions?: number
  freezeAllowance?: number
  active: boolean
  createdAt: string
}

export interface MembershipDetail {
  id: number
  memberId: number
  memberName: string
  planId: number
  planName: string
  startDate: string
  endDate: string
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'FROZEN' | 'CANCELLED' | 'PENDING_PAYMENT'
  price: number
  discountAmount?: number
  taxAmount?: number
  totalAmount: number
  frozenUntil?: string
  freezeCount: number
  daysRemaining: number
  renewalDate?: string
}

export interface PaymentTransaction {
  id: number
  memberId: number
  memberName: string
  amount: number
  paymentDate: string
  paymentMode: 'CASH' | 'CARD' | 'UPI' | 'CHEQUE'
  description?: string
  referenceNo?: string
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
}

export interface FeeCollection {
  totalMembers: number
  paidMembers: number
  pendingMembers: number
  overdueFees: number
  totalCollected: number
  totalPending: number
  collectionPercentage: number
}

