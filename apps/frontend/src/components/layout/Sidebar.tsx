import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getNavItemsForRole } from '../../utils/roleAccess'
import './Sidebar.css'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(isCollapsed)

  // Load sidebar state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState !== null) {
        const parsed = JSON.parse(savedState)
        if (typeof parsed === 'boolean') {
          setCollapsed(parsed)
          onToggle?.(parsed)
        }
      }
    } catch {
      // Ignore malformed persisted state and keep default sidebar behavior.
      localStorage.removeItem('sidebarCollapsed')
    }
  }, [onToggle])

  useEffect(() => {
    setCollapsed(isCollapsed)
  }, [isCollapsed])

  // Handle toggle
  const handleToggle = () => {
    const newState = !collapsed
    setCollapsed(newState)
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newState))
    } catch {
      // Ignore persistence errors in restricted browser storage contexts.
    }
    onToggle?.(newState)
  }

  // Get navigation items based on user role
  const NAV_ITEMS = user ? getNavItemsForRole(user.role) : []
  const isNavItemActive = (path: string) => {
    const [pathname, queryString] = path.split('?')
    if (location.pathname !== pathname) return false
    if (!queryString) return true
    return location.search.includes(queryString)
  }
  const roleLabel = user?.role === 'USER'
    ? 'Member'
    : user?.role === 'SUPER_ADMIN'
      ? 'Super Admin'
      : user?.role

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header with Toggle Button */}
      <div className="sidebar-header">
        <button className="logo-btn" onClick={() => navigate('/dashboard')}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">FitTrack</span>
        </button>
        <button
          className="sidebar-toggle-btn"
          onClick={handleToggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '▶️' : '◀️'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item: any) => (
          <button
            key={item.path}
            className={`nav-item ${isNavItemActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Settings & Profile */}
      <div className="sidebar-footer">
        <button
          className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
          title="Settings"
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-avatar">
            {user?.fullName?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.fullName || 'User'}</div>
            <div className="profile-role">{roleLabel}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            🚪
          </button>
        </div>
      </div>
    </div>
  )
}

