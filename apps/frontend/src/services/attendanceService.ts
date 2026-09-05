import { api } from './api'
import type { AttendanceDTO, AttendanceRecord, AttendanceStats } from '../types/attendance'

class AttendanceService {
  private baseUrl = '/api/attendance'

  async checkIn(memberId: number): Promise<AttendanceDTO> {
    try {
      const response = await api.post(`${this.baseUrl}/check-in`, { memberId })
      return response.data?.data || response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Check-in failed'
      throw new Error(message)
    }
  }

  async checkOut(memberId: number): Promise<AttendanceDTO> {
    try {
      const response = await api.post(`${this.baseUrl}/check-out`, { memberId })
      return response.data?.data || response.data
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Check-out failed'
      throw new Error(message)
    }
  }

  async getTodayAttendance(memberId: number): Promise<AttendanceDTO | null> {
    try {
      const response = await api.get(`${this.baseUrl}/today/${memberId}`)
      return response.data?.data || null
    } catch (error) {
      console.error('Error fetching today attendance:', error)
      return null
    }
  }

  async getRecordsByDate(date: string): Promise<AttendanceRecord[]> {
    try {
      const response = await api.get(`${this.baseUrl}/records?date=${date}`)
      const payload = response.data

      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload?.data)) return payload.data
      if (Array.isArray(payload?.content)) return payload.content
      if (Array.isArray(payload?.data?.content)) return payload.data.content

      return []
    } catch (error) {
      console.error('Error fetching records by date:', error)
      return []
    }
  }

  async getStats(): Promise<AttendanceStats | null> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`)
      const payload = response.data

      if (payload?.data && typeof payload.data === 'object') return payload.data
      if (payload && typeof payload === 'object') return payload

      return null
    } catch (error) {
      console.error('Error fetching stats:', error)
      return null
    }
  }
}

export const attendanceService = new AttendanceService()
