import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getNavItemsForRole } from '../../utils/roleAccess'
import './Sidebar.css'


export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

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
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <button className="logo-btn" onClick={() => navigate('/dashboard')}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">FitTrack</span>
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

