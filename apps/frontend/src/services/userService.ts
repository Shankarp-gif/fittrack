import { api } from './api'
import type { AppSettings, CreateGoalRequest, GoalItem, PlansResponse, UpdateProfileRequest, UserMe } from '../types/auth'

export const userService = {
  async getMe() {
    const { data } = await api.get<UserMe>('/api/users/me')
    return data
  },
  async updateMe(payload: UpdateProfileRequest) {
    const { data } = await api.put<UserMe>('/api/users/me', payload)
    return data
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
