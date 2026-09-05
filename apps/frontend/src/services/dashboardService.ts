import { api } from './api'
import type { DashboardResponse } from '../types/dashboard'

export const dashboardService = {
  async getDashboard() {
    const { data } = await api.get<DashboardResponse>('/api/dashboard')
    return data
  },
}

