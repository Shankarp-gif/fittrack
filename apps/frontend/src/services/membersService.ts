import { api } from './api'
import type { Member, MembersResponse, CreateMemberRequest, UpdateMemberRequest } from '../types/members'

interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data?: T
}

const emptyMembersResponse: MembersResponse = {
  content: [],
  page: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
}

function unwrapApiData<T>(payload: T | ApiEnvelope<T> | null | undefined): T | null {
  if (!payload) {
    return null
  }

  if (typeof payload === 'object' && 'data' in payload) {
    return payload.data ?? null
  }

  return payload as T
}

function requireApiData<T>(payload: T | ApiEnvelope<T> | null | undefined, errorMessage: string): T {
  const result = unwrapApiData<T>(payload)
  if (result == null) {
    throw new Error(errorMessage)
  }
  return result
}

export const membersService = {
  async listMembers(page: number = 0, pageSize: number = 10, sortBy: string = 'id', sortDir: string = 'DESC') {
    const { data } = await api.get<ApiEnvelope<MembersResponse> | MembersResponse>('/api/members', {
      params: { page, size: pageSize, sort: `${sortBy},${sortDir}` },
    })
    return unwrapApiData<MembersResponse>(data) ?? emptyMembersResponse
  },

  async getMember(id: number) {
    const { data } = await api.get<ApiEnvelope<Member> | Member>(`/api/members/${id}`)
    return requireApiData<Member>(data, 'Member details were not returned by the server.')
  },

  async createMember(payload: CreateMemberRequest) {
    const { data } = await api.post<ApiEnvelope<Member> | Member>('/api/members', payload)
    return requireApiData<Member>(data, 'Created member details were not returned by the server.')
  },

  async updateMember(id: number, payload: UpdateMemberRequest) {
    const { data } = await api.put<ApiEnvelope<Member> | Member>(`/api/members/${id}`, payload)
    return requireApiData<Member>(data, 'Updated member details were not returned by the server.')
  },

  async deleteMember(id: number) {
    const { data } = await api.delete<ApiEnvelope<void> | void>(`/api/members/${id}`)
    return unwrapApiData<void>(data)
  },

  async searchMembers(query: string, page: number = 0, pageSize: number = 10) {
    const { data } = await api.get<ApiEnvelope<MembersResponse> | MembersResponse>('/api/members/search', {
      params: { query, page, size: pageSize },
    })
    return unwrapApiData<MembersResponse>(data) ?? emptyMembersResponse
  },

  async getMemberByEmail(email: string) {
    const { data } = await api.get('/api/members/by-email', {
      params: { email },
    })
    return data?.data || data
  },
}

