import { api } from './api'
import type { GymRole } from '../types/auth'

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data?: T
}

export interface HierarchyAuditSummary {
  generatedAt: string
  scope: 'GLOBAL' | 'ORGANIZATION'
  organizationId?: number
  organizationName?: string
  totalOrganizations: number
  totalUsers: number
  usersWithoutOrganization: number
  usersWithoutBranch: number
  usersWithBranchMismatch: number
  usersWithoutSupervisor: number
  usersWithInvalidSupervisor: number
  usersWithInactiveSupervisor: number
  usersWithHierarchyCycle: number
}

export interface HierarchyAuditIssue {
  userId: number
  fullName: string
  email: string
  role: GymRole
  active: boolean
  organizationId?: number
  organizationName?: string
  branchId?: number
  branchName?: string
  supervisorId?: number
  supervisorName?: string
  issueCode: string
  severity: 'critical' | 'warning'
  message: string
  recommendedAction: string
}

export interface HierarchyAuditSnapshot {
  summary: HierarchyAuditSummary
  issues: HierarchyAuditIssue[]
}

function unwrapApiData<T>(payload: T | ApiEnvelope<T> | null | undefined): T | null {
  if (!payload) {
    return null
  }

  if (typeof payload === 'object' && 'data' in payload) {
    return payload.data ?? null
  }

  return payload as T
}

export const hierarchyAuditService = {
  async getSnapshot() {
    const { data } = await api.get<ApiEnvelope<HierarchyAuditSnapshot> | HierarchyAuditSnapshot>('/api/admin/hierarchy-audit')
    return unwrapApiData<HierarchyAuditSnapshot>(data)
  },
}

