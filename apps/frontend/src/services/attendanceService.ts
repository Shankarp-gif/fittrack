import { api } from './api'
import type { AttendanceDTO, AttendanceRecord, AttendanceStats } from '../types/attendance'

class AttendanceService {
  private baseUrl = '/api/attendance'

  private getFriendlyActionError(action: 'check-in' | 'check-out', error: any): string {
    const raw = error?.response?.data?.message || error?.message || `${action} failed`
    const normalized = String(raw)

    if (normalized.includes('member_attendance_org_not_null') || normalized.includes('could not execute statement')) {
      return `Unable to ${action} right now. Please refresh and try again.`
    }

    return normalized
  }

  async checkIn(memberId: number): Promise<AttendanceDTO> {
    try {
      const response = await api.post(`${this.baseUrl}/check-in`, { memberId })
      console.log('Check-in response:', response.data)
      return response.data?.data || response.data
    } catch (error: any) {
      console.error('Check-in error:', error)
      const message = this.getFriendlyActionError('check-in', error)
      throw new Error(message)
    }
  }

  async checkOut(memberId: number): Promise<AttendanceDTO> {
    try {
      const response = await api.post(`${this.baseUrl}/check-out`, { memberId })
      console.log('Check-out response:', response.data)
      return response.data?.data || response.data
    } catch (error: any) {
      console.error('Check-out error:', error)
      const message = this.getFriendlyActionError('check-out', error)
      throw new Error(message)
    }
  }

  async getTodayAttendance(memberId: number): Promise<AttendanceDTO | null> {
    try {
      const response = await api.get(`${this.baseUrl}/today/${memberId}`)
      console.log('Today attendance response:', response.data)
      // Handle ApiResponse format
      return response.data?.data || null
    } catch (error) {
      console.error('Error fetching today attendance:', error)
      return null
    }
  }

  async getRecordsByDate(date: string): Promise<AttendanceRecord[]> {
    try {
      const response = await api.get(`${this.baseUrl}/records`, { params: { date } })
      console.log('Records response:', response.data)
      const payload = response.data

      // Handle ApiResponse format: { success, message, data: [...] }
      if (payload?.data && Array.isArray(payload.data)) return payload.data
      // Handle direct array response
      if (Array.isArray(payload)) return payload
      // Handle paginated response
      if (payload?.content && Array.isArray(payload.content)) return payload.content

      return []
    } catch (error) {
      console.error('Error fetching records by date:', error)
      return []
    }
  }

  async getStats(memberId: number, endDate?: string): Promise<AttendanceStats | null> {
    try {
      const today = endDate || new Date().toISOString().split('T')[0]
      const selectedDate = new Date(today)
      const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      const startDate = monthStart.toISOString().split('T')[0]

      const response = await api.get(`${this.baseUrl}/stats/${memberId}`, {
        params: { startDate, endDate: today }
      })
      console.log('Stats response:', response.data)
      const payload = response.data
      const statsData = payload?.data || payload

      if (statsData && typeof statsData === 'object' && statsData.totalDays !== undefined) {
        const presentDays = Number(statsData.totalDaysAttended ?? statsData.presentDays ?? 0)
        const totalDays = Number(statsData.totalDays ?? 0)
        const attendancePercentage = Number(statsData.attendancePercentage ?? 0)

        return {
          totalDays,
          presentDays,
          absentDays: Math.max(totalDays - presentDays, 0),
          attendancePercentage,
          currentMonth: selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching stats:', error)
      return null
    }
  }
}

export const attendanceService = new AttendanceService()
