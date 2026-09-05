import { api } from './api'
import type { ReportsResponse, MemberReport, FinancialReport, AttendanceReport } from '../types/reports'

export const reportsService = {
  async getReports() {
    const { data } = await api.get<ReportsResponse>('/api/reports')
    return data
  },

  async getMemberReport() {
    const { data } = await api.get<MemberReport>('/api/reports/members')
    return data
  },

  async getFinancialReport() {
    const { data } = await api.get<FinancialReport>('/api/reports/financial')
    return data
  },

  async getAttendanceReport() {
    const { data } = await api.get<AttendanceReport>('/api/reports/attendance')
    return data
  },

  async exportReport(reportType: 'pdf' | 'excel') {
    const { data } = await api.get(`/api/reports/export`, {
      params: { format: reportType },
      responseType: 'blob',
    })
    return data
  },
}

