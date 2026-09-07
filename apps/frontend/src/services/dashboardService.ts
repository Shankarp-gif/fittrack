import { api } from './api'
import type { DashboardResponse } from '../types/dashboard'
import type { ProgressAnalyticsResponse } from '../types/progressAnalytics'

export const dashboardService = {
  async getDashboard() {
    const { data } = await api.get<DashboardResponse>('/api/dashboard')
    return data
  },

  async getProgressAnalytics() {
    const { data } = await api.get<ProgressAnalyticsResponse>('/api/dashboard/progress-analytics')
    return data
  },

  async startWorkout(workoutTitle: string) {
    const { data } = await api.post('/api/dashboard/workouts/start', { title: workoutTitle })
    return data
  },

  async completeWorkout(workoutId: number) {
    const { data } = await api.post(`/api/dashboard/workouts/${workoutId}/complete`)
    return data
  },
}

