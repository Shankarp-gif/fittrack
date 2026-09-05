import { api } from './api'
import type { DashboardResponse } from '../types/dashboard'

export const dashboardService = {
  async getDashboard() {
    const { data } = await api.get<DashboardResponse>('/api/dashboard')
    return data
  },

  async startWorkout(workoutTitle: string) {
    const { data } = await api.post('/api/workouts/start', { title: workoutTitle })
    return data
  },

  async completeWorkout(workoutId: number) {
    const { data } = await api.post(`/api/workouts/${workoutId}/complete`)
    return data
  },
}

