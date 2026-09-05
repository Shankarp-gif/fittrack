import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getNavItemsForRole } from '../../utils/roleAccess'
import './Sidebar.css'


export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  // Get navigation items based on user role
  const NAV_ITEMS = user ? getNavItemsForRole(user.role) : []

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <button className="logo-btn" onClick={() => navigate('/dashboard')}>
          <span className="logo-icon">⚡</span>
          {!collapsed && <span className="logo-text">FitTrack</span>}
        </button>
        <button className="collapse-btn" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item: any) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
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
          title={collapsed ? 'Settings' : ''}
        >
          <span className="nav-icon">⚙️</span>
          {!collapsed && <span className="nav-label">Settings</span>}
        </button>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-avatar">
            {user?.fullName?.[0]?.toUpperCase() || 'A'}
          </div>
          {!collapsed && (
            <div className="profile-info">
              <div className="profile-name">{user?.fullName || 'User'}</div>
              <div className="profile-role">{user?.role === 'USER' ? 'Member' : user?.role}</div>
            </div>
          )}
          <button className="logout-btn" onClick={logout} title="Logout">
            🚪
          </button>
        </div>
      </div>
    </div>
  )
}

