import { api } from './api'
import type { AppNotificationItem, AppNotificationUnreadCount } from '../types/notifications'

export const notificationsService = {
  async list() {
    const { data } = await api.get<AppNotificationItem[]>('/api/notifications')
    return data
  },

  async listUnread() {
    const { data } = await api.get<AppNotificationItem[]>('/api/notifications/unread')
    return data
  },

  async unreadCount() {
    const { data } = await api.get<AppNotificationUnreadCount>('/api/notifications/unread-count')
    return data
  },

  async markAsRead(id: number) {
    const { data } = await api.put<AppNotificationItem>(`/api/notifications/${id}/read`)
    return data
  },

  async markAllAsRead() {
    await api.put('/api/notifications/read-all')
  },

  async remove(id: number) {
    await api.delete(`/api/notifications/${id}`)
  },
}

