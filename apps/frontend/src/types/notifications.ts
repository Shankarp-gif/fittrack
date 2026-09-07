export interface AppNotificationItem {
  id: number
  type: string
  title: string
  message: string
  data?: unknown
  read: boolean
  readAt?: string | null
  createdAt: string
}

export interface AppNotificationUnreadCount {
  count: number
}

