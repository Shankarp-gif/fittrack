import { useEffect, useState } from 'react'
import { notificationsService } from '../services/notificationsService'
import type { AppNotificationItem } from '../types/notifications'

export function NotificationsPage() {
  const [items, setItems] = useState<AppNotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await notificationsService.list())
    } catch {
      setError('Unable to load notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const markAsRead = async (id: number) => {
    await notificationsService.markAsRead(id)
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }

  const markAllAsRead = async () => {
    await notificationsService.markAllAsRead()
    setItems((current) => current.map((item) => ({ ...item, read: true })))
  }

  const remove = async (id: number) => {
    await notificationsService.remove(id)
    setItems((current) => current.filter((item) => item.id !== id))
  }

  if (loading) return <div className="panel">Loading notifications...</div>

  return (
    <div className="stack-gap">
      <section className="panel row-space">
        <div>
          <h1>Notifications</h1>
          <p className="muted">Stay updated on gym events, alerts, and workout activity.</p>
        </div>
        <div className="row-gap">
          <button type="button" className="ghost-btn" onClick={loadNotifications}>Refresh</button>
          <button type="button" className="primary-btn" onClick={markAllAsRead}>Mark all as read</button>
        </div>
      </section>

      {error ? <section className="panel error">{error}</section> : null}
      {!error && items.length === 0 ? <section className="panel">No notifications found.</section> : null}

      {items.map((item) => (
        <section key={item.id} className="panel row-space">
          <div>
            <h3>{item.title}</h3>
            <p className="muted">{item.message}</p>
            <p className="muted">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
          <div className="row-gap">
            {!item.read ? (
              <button type="button" className="ghost-btn" onClick={() => markAsRead(item.id)}>Mark read</button>
            ) : null}
            <button type="button" className="ghost-btn" onClick={() => remove(item.id)}>Delete</button>
          </div>
        </section>
      ))}
    </div>
  )
}

