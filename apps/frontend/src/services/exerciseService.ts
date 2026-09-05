import { api } from './api'
import type { Exercise, PagedResponse } from '../types/exercise'

export const exerciseService = {
  async list(params: { q?: string; muscleGroup?: string; equipment?: string; page?: number; size?: number }) {
    const { data } = await api.get<PagedResponse<Exercise>>('/api/exercises', { params })
    return data
  },

  async addToWorkout(exerciseId: number) {
    const { data } = await api.post('/api/workouts/add-exercise', { exerciseId })
    return data
  },

  async getDetails(exerciseId: number) {
    const { data } = await api.get(`/api/exercises/${exerciseId}`)
    return data
  },
}

