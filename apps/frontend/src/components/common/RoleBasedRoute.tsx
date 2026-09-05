import { Navigate } from 'react-router-dom'
import type { GymRole } from '../../types/auth'
import { useAuth } from '../../context/AuthContext'
import { hasPageAccess } from '../../utils/roleAccess'

interface RoleBasedRouteProps {
  children: React.JSX.Element
  requiredRoles?: GymRole[]
  path?: string
}

/**
 * Component to protect routes based on user role
 * Usage: <RoleBasedRoute requiredRoles={['ADMIN', 'TRAINER']}><YourComponent /></RoleBasedRoute>
 */
export function RoleBasedRoute({
  children,
  requiredRoles,
  path,
}: RoleBasedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access
  const allowedRoles = requiredRoles || []
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />
  }

  // Check page-based access
  if (path && !hasPageAccess(user.role, path)) {
    return <Navigate to="/access-denied" replace />
  }

  return children
}

/**
 * Hook to check if user has access
 */
export function useRoleAccess(requiredRoles: GymRole[]): boolean {
  const { user } = useAuth()
  if (!user) return false
  return requiredRoles.includes(user.role)
}

/**
 * Hook to check if user has any specific role
 */
export function useIsRole(role: GymRole): boolean {
  const { user } = useAuth()
  return user?.role === role
}

