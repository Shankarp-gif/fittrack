export interface Member {
  id: number
  memberIdNumber: string
  fullName: string
  email: string
  mobile: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'FROZEN' | 'CANCELLED' | 'PENDING_PAYMENT'
  notes: string
  photoUrl?: string
  createdAt: string
  updatedAt: string
}

export interface MembersResponse {
  content: Member[]
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CreateMemberRequest {
  fullName: string
  email: string
  mobile: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  notes?: string
  photoUrl?: string
}

export interface UpdateMemberRequest extends CreateMemberRequest {
  status?: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'FROZEN' | 'CANCELLED' | 'PENDING_PAYMENT'
}

