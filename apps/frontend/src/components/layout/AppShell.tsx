import { NavLink, Outlet } from 'react-router-dom'
import { Activity, CalendarDays, ClipboardList, Dumbbell, Gauge, Goal, Home, Medal, Settings, Shield, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/plans', label: 'Plans', icon: ClipboardList },
  { to: '/exercises', label: 'Exercises', icon: Activity },
  { to: '/activity', label: 'Activity', icon: CalendarDays },
  { to: '/progress', label: 'Progress', icon: Gauge },
  { to: '/goals', label: 'Goals', icon: Goal },
  { to: '/achievements', label: 'Achievements', icon: Medal },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const allNav = user?.role === 'ADMIN' ? [...nav, { to: '/admin', label: 'Admin', icon: Shield }] : nav

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="brand">FITTRACK</p>
          <p className="muted">Train smarter daily</p>
        </div>
        <nav className="nav-stack">
          {allNav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} className="nav-item">
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="sidebar-footer">
          <p className="muted">{user?.fullName}</p>
          <button className="ghost-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
