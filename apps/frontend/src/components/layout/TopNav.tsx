import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Modal } from '../common/Modal'
import { logger } from '../../utils/Logger'
import { notificationsService } from '../../services/notificationsService'
import type { AppNotificationItem } from '../../types/notifications'
import type { GymRole } from '../../types/auth'
import {
  getDashboardSearchPlaceholder,
  getQuickAddActionsForRole,
  getTopNavConfigForRole,
  resolveDashboardSearchPath,
} from '../../utils/dashboardActions'
import './TopNav.css'

export function TopNav() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState('')
  const role = (user?.role ?? 'ADMIN') as GymRole
  const quickActions = getQuickAddActionsForRole(role)
  const topNavConfig = getTopNavConfigForRole(role)
  const searchPlaceholder = getDashboardSearchPlaceholder(role)
  const showQuickAddButton = topNavConfig.showQuickAdd && quickActions.length > 0

  const refreshUnreadCount = async () => {
    try {
      const payload = await notificationsService.unreadCount()
      setUnreadCount(payload.count ?? 0)
    } catch {
      setUnreadCount(0)
    }
  }

  const loadNotifications = async () => {
    setNotificationsLoading(true)
    setNotificationsError('')
    try {
      const data = await notificationsService.list()
      setNotifications(data)
      await refreshUnreadCount()
    } catch {
      setNotificationsError('Unable to load notifications. Please try again.')
    } finally {
      setNotificationsLoading(false)
    }
  }

  useEffect(() => {
    refreshUnreadCount()
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && topNavConfig.showSearch) {
        event.preventDefault()
        setSearchOpen(true)
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [topNavConfig.showSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const role = (user?.role ?? 'ADMIN') as GymRole
    const destination = resolveDashboardSearchPath(role, searchQuery)
    if (destination) {
      logger.info('Global search', { query: searchQuery, role, destination })
      navigate(destination)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const handleThemeToggle = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme as 'light' | 'dark')
  }

  const openNotifications = async () => {
    setShowNotifications(true)
    await loadNotifications()
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id)
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
      await refreshUnreadCount()
    } catch {
      setNotificationsError('Unable to mark notification as read.')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
      await refreshUnreadCount()
    } catch {
      setNotificationsError('Unable to mark all notifications as read.')
    }
  }

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationsService.remove(id)
      setNotifications((current) => current.filter((item) => item.id !== id))
      await refreshUnreadCount()
    } catch {
      setNotificationsError('Unable to delete notification.')
    }
  }

  return (
    <>
      <div className="topnav">
        {/* Left Section - Search */}
        <div className="topnav-left">
          {topNavConfig.showSearch && searchOpen ? (
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input"
              />
              <button type="submit" className="search-btn">🔍</button>
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false)
                  setSearchQuery('')
                }}
                className="search-close"
              >
                ✕
              </button>
            </form>
          ) : topNavConfig.showSearch ? (
            <button onClick={() => setSearchOpen(true)} className="search-trigger">
              <span>🔍</span>
              <span className="search-placeholder">{searchPlaceholder}</span>
              <span className="search-hint">⌘K</span>
            </button>
          ) : (
            <div className="topnav-search-placeholder-spacer" />
          )}
        </div>

        {/* Right Section */}
        <div className="topnav-right">
          {/* Quick Add Button */}
          {showQuickAddButton ? (
            <button
              className="quick-add-btn"
              onClick={() => setShowQuickAdd(true)}
              title={topNavConfig.quickAddLabel}
            >
              <span>➕</span>
              <span>{topNavConfig.quickAddLabel}</span>
            </button>
          ) : null}

          {/* Notifications */}
          <button className="topnav-btn notification-btn" title="Notifications" onClick={openNotifications}>
            <span>🔔</span>
            {unreadCount > 0 ? <span className="notification-badge">{Math.min(unreadCount, 99)}</span> : null}
          </button>

          {/* Theme Toggle */}
          <button
            className="topnav-btn theme-toggle-btn"
            onClick={handleThemeToggle}
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {resolvedTheme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Profile */}
          <button className="profile-btn" title={user?.fullName || 'Profile'} onClick={() => navigate('/settings')}>
            <div className="profile-avatar-mini">
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="profile-name-mini">{user?.fullName?.split(' ')[0] || 'Admin'}</span>
          </button>
        </div>
      </div>

      {/* Quick Add Modal */}
      <Modal
        isOpen={showQuickAdd && showQuickAddButton}
        title="Quick Actions"
        onClose={() => setShowQuickAdd(false)}
        size="sm"
      >
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="quick-action-item"
              onClick={() => {
                navigate(action.path)
                setShowQuickAdd(false)
              }}
            >
              <div className="quick-action-icon">{action.icon}</div>
              <div className="quick-action-label">{action.label}</div>
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={showNotifications}
        title="Notifications"
        onClose={() => setShowNotifications(false)}
        size="md"
      >
        <div className="topnav-notifications-actions">
          <button type="button" className="ghost-btn" onClick={loadNotifications}>Refresh</button>
          <button type="button" className="ghost-btn" onClick={handleMarkAllAsRead}>Mark all as read</button>
          <button
            type="button"
            className="primary-btn"
            onClick={() => {
              setShowNotifications(false)
              navigate('/notifications')
            }}
          >
            View all
          </button>
        </div>

        {notificationsLoading ? <p className="muted">Loading notifications...</p> : null}
        {notificationsError ? <p className="error">{notificationsError}</p> : null}
        {!notificationsLoading && !notificationsError && notifications.length === 0 ? (
          <p className="muted">No notifications yet.</p>
        ) : null}

        <div className="topnav-notifications-list">
          {notifications.map((notification) => (
            <article key={notification.id} className={`topnav-notification-item ${notification.read ? 'is-read' : ''}`}>
              <div>
                <h4>{notification.title}</h4>
                <p className="muted">{notification.message}</p>
                <p className="muted topnav-notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="topnav-notification-buttons">
                {!notification.read ? (
                  <button type="button" className="ghost-btn" onClick={() => handleMarkAsRead(notification.id)}>
                    Mark read
                  </button>
                ) : null}
                <button type="button" className="ghost-btn" onClick={() => handleDeleteNotification(notification.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </Modal>
    </>
  )
}

