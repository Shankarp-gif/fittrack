import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Modal } from '../common/Modal'
import { logger } from '../../utils/Logger'
import './TopNav.css'

export function TopNav() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { setTheme, resolvedTheme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showQuickAdd, setShowQuickAdd] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      logger.info('Global search', { query: searchQuery })
      navigate(`/members?search=${searchQuery}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const handleThemeToggle = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme as 'light' | 'dark')
  }

  const quickActions = [
    { icon: '👤', label: 'Add Member', action: () => navigate('/members?action=create') },
    { icon: '📋', label: 'Mark Attendance', action: () => navigate('/attendance') },
    { icon: '💳', label: 'Record Payment', action: () => navigate('/payments?action=create') },
    { icon: '🎫', label: 'New Membership', action: () => navigate('/memberships?action=create') },
    { icon: '🎯', label: 'Add Lead', action: () => navigate('/leads?action=create') },
    { icon: '💰', label: 'Add Expense', action: () => navigate('/expenses?action=create') },
  ]

  return (
    <>
      <div className="topnav">
        {/* Left Section - Search */}
        <div className="topnav-left">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search members, payments, plans..."
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
          ) : (
            <button onClick={() => setSearchOpen(true)} className="search-trigger">
              <span>🔍</span>
              <span className="search-placeholder">Search members, payments...</span>
              <span className="search-hint">⌘K</span>
            </button>
          )}
        </div>

        {/* Right Section */}
        <div className="topnav-right">
          {/* Quick Add Button */}
          <button
            className="quick-add-btn"
            onClick={() => setShowQuickAdd(true)}
            title="Quick Actions"
          >
            <span>➕</span>
            <span>Quick Add</span>
          </button>

          {/* Notifications */}
          <button className="topnav-btn notification-btn" title="Notifications">
            <span>🔔</span>
            <span className="notification-badge">3</span>
          </button>

          {/* Theme Toggle */}
          <button
            className="topnav-btn"
            onClick={handleThemeToggle}
            title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {resolvedTheme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Profile */}
          <button className="profile-btn" title={user?.fullName || 'Profile'}>
            <div className="profile-avatar-mini">
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </div>
            <span className="profile-name-mini">{user?.fullName?.split(' ')[0] || 'Admin'}</span>
          </button>
        </div>
      </div>

      {/* Quick Add Modal */}
      <Modal
        isOpen={showQuickAdd}
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
                action.action()
                setShowQuickAdd(false)
              }}
            >
              <div className="quick-action-icon">{action.icon}</div>
              <div className="quick-action-label">{action.label}</div>
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}

