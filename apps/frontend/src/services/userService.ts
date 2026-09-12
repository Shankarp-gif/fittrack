import { api } from './api'
import type { AppSettings, CreateGoalRequest, GoalItem, PlansResponse, UpdateProfileRequest, UserMe } from '../types/auth'

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data?: T
}

export interface ManageableUser {
  id: number
  employeeIdNumber?: string
  fullName: string
  email: string
  role: UserMe['role']
  active: boolean
  createdAt: string
  organizationId?: number
  organizationName?: string
  branchId?: number
  branchName?: string
  supervisorId?: number
  supervisorName?: string
}

export interface ManagedOrganization {
  id: number
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  active: boolean
}

export interface CreateManagedUserRequest {
  fullName: string
  email: string
  role: UserMe['role']
  organizationId?: number
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

export const userService = {
  async getMe() {
    const { data } = await api.get<UserMe>('/api/users/me')
    return data
  },
  async updateMe(payload: UpdateProfileRequest) {
    const { data } = await api.put<UserMe>('/api/users/me', payload)
    return data
  },
  async getAllUsers() {
    const { data } = await api.get<ApiEnvelope<ManageableUser[]> | ManageableUser[]>('/api/users/all')
    return unwrapApiData<ManageableUser[]>(data) ?? []
  },
  async getAllOrganizations() {
    const { data } = await api.get<ApiEnvelope<ManagedOrganization[]> | ManagedOrganization[]>('/api/users/organization/all')
    return unwrapApiData<ManagedOrganization[]>(data) ?? []
  },
  async getUsersByOrganization(organizationId: number) {
    const { data } = await api.get<ApiEnvelope<ManageableUser[]> | ManageableUser[]>(`/api/users/organization/${organizationId}/users`)
    return unwrapApiData<ManageableUser[]>(data) ?? []
  },
  async createUserWithDefaultPassword(payload: CreateManagedUserRequest) {
    const { data } = await api.post<ApiEnvelope<UserMe> | UserMe>('/api/users/create-with-default-password', payload)
    return unwrapApiData<UserMe>(data)
  },
}

export const goalsService = {
  async list() {
    const { data } = await api.get<GoalItem[]>('/api/goals')
    return data
  },
  async create(payload: CreateGoalRequest) {
    const { data } = await api.post<GoalItem>('/api/goals', payload)
    return data
  },
  async updateProgress(goalId: number, currentValue: number) {
    const { data } = await api.put<GoalItem>(`/api/goals/${goalId}/progress`, { currentValue })
    return data
  },
}

export const plansService = {
  async get() {
    const { data } = await api.get<PlansResponse>('/api/plans')
    return data
  },
  async activate(planId: string) {
    const { data } = await api.post<PlansResponse>('/api/plans/activate', { planId })
    return data
  },
}

export const settingsService = {
  async get() {
    const { data } = await api.get<AppSettings>('/api/settings')
    return data
  },
  async update(payload: AppSettings) {
    const { data } = await api.put<AppSettings>('/api/settings', payload)
    return data
  },
}
