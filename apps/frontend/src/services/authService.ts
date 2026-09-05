import { api } from './api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth'

export const authService = {
  login: async (payload: LoginRequest) => {
    const { data } = await api.post<AuthResponse>('/api/auth/login', payload)
    return data
  },
  register: async (payload: RegisterRequest) => {
    const { data } = await api.post<AuthResponse>('/api/auth/register', payload)
    return data
  },
  refresh: async (refreshToken: string) => {
    const { data } = await api.post<AuthResponse>('/api/auth/refresh', { refreshToken })
    return data
  },
}

