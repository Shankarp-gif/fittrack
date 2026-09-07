import { api } from './api'
import type { Member, MembersResponse, CreateMemberRequest, UpdateMemberRequest } from '../types/members'

export const membersService = {
  async listMembers(page: number = 0, pageSize: number = 10, sortBy: string = 'id', sortDir: string = 'DESC') {
    const { data } = await api.get<MembersResponse>('/api/members', {
      params: { page, size: pageSize, sort: `${sortBy},${sortDir}` },
    })
    return data
  },

  async getMember(id: number) {
    const { data } = await api.get<Member>(`/api/members/${id}`)
    return data
  },

  async createMember(payload: CreateMemberRequest) {
    const { data } = await api.post<Member>('/api/members', payload)
    return data
  },

  async updateMember(id: number, payload: UpdateMemberRequest) {
    const { data } = await api.put<Member>(`/api/members/${id}`, payload)
    return data
  },

  async deleteMember(id: number) {
    const { data } = await api.delete<void>(`/api/members/${id}`)
    return data
  },

  async searchMembers(query: string, page: number = 0, pageSize: number = 10) {
    const { data } = await api.get<MembersResponse>('/api/members/search', {
      params: { query, page, size: pageSize },
    })
    return data
  },

  async getMemberByEmail(email: string) {
    const { data } = await api.get('/api/members/by-email', {
      params: { email },
    })
    return data?.data || data
  },
}

