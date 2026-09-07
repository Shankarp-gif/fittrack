/**
 * Role-Based Access Control Utilities
 */

import type { GymRole } from '../types/auth'

/**
 * Role Hierarchy and Permissions
 */
export const ROLE_HIERARCHY: Record<GymRole, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  TRAINER: 3,
  RECEPTIONIST: 2,
  USER: 1,
}

export const ROLE_LABELS: Record<GymRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Gym Owner',
  TRAINER: 'Trainer',
  RECEPTIONIST: 'Receptionist',
  USER: 'Member',
}

export const ROLE_DESCRIPTIONS: Record<GymRole, string> = {
  SUPER_ADMIN: 'Platform-level access - Manage all gyms and system-level settings',
  ADMIN: 'Full system access - Manage all gym operations',
  TRAINER: 'Trainer account - Manage training sessions and member progress',
  RECEPTIONIST: 'Front desk staff - Handle check-ins, registrations, and fees',
  USER: 'Gym member - Track workouts and personal progress',
}

/**
 * Page Access Control
 * Define which roles can access which pages
 */
export const PAGE_ACCESS: Record<string, GymRole[]> = {
  '/dashboard': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST'],
  '/superadmin-dashboard': ['SUPER_ADMIN'],
  '/admin-dashboard': ['SUPER_ADMIN', 'ADMIN'],
  '/trainer-dashboard': ['SUPER_ADMIN', 'ADMIN', 'TRAINER'],
  '/receptionist-dashboard': ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'],
  '/member-dashboard': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER'],
  '/attendance': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER'],
  '/fees': ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'],
  '/membership-plans': ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'USER'],
  '/members': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST'],
  '/members/new': ['SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST'],
  '/trainers': ['SUPER_ADMIN', 'ADMIN'],
  '/classes': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST'],
  '/reports': ['SUPER_ADMIN', 'ADMIN'],
  '/workouts': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'USER'],
  '/progress': ['SUPER_ADMIN', 'ADMIN', 'USER', 'TRAINER'],
  '/goals': ['SUPER_ADMIN', 'ADMIN', 'USER', 'TRAINER'],
  '/notifications': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER'],
  '/user-management': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST'],
  '/settings': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER'],
  '/plans': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'USER'],
   '/hierarchy': ['SUPER_ADMIN', 'ADMIN'],
   '/organizations': ['SUPER_ADMIN'],
   '/organizations-hierarchy': ['SUPER_ADMIN'],
   '/role-management': ['SUPER_ADMIN', 'ADMIN'],
}

/**
 * Check if user has access to a page
 */
export function hasPageAccess(userRole: GymRole, path: string): boolean {
  const allowedRoles = PAGE_ACCESS[path]
  if (!allowedRoles) return true // If not restricted, allow all
  return allowedRoles.includes(userRole)
}

/**
 * Check if user has any of the required roles
 */
export function hasRole(userRole: GymRole, requiredRoles: GymRole[]): boolean {
  return requiredRoles.includes(userRole)
}

/**
 * Check if user has higher or equal role hierarchy
 */
export function hasRoleLevel(userRole: GymRole, requiredRole: GymRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Get dashboard path based on role
 */
export function getDashboardPathForRole(role: GymRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/superadmin-dashboard'
    case 'ADMIN':
      return '/admin-dashboard'
    case 'TRAINER':
      return '/trainer-dashboard'
    case 'RECEPTIONIST':
      return '/receptionist-dashboard'
    case 'USER':
      return '/member-dashboard'
    default:
      return '/dashboard'
  }
}

/**
 * Get navigation items based on role
 */
export function getNavItemsForRole(role: GymRole) {
  if (role === 'USER') {
    return [
      { icon: '💪', label: 'My Dashboard', path: '/member-dashboard' },
      { icon: '📋', label: 'Check-In', path: '/attendance' },
      { icon: '🎫', label: 'My Membership', path: '/membership-plans' },
      { icon: '💪', label: 'Workouts', path: '/workouts' },
      { icon: '📊', label: 'Progress', path: '/progress' },
      { icon: '🎯', label: 'Goals', path: '/goals' },
      { icon: '🔔', label: 'Notifications', path: '/notifications' },
    ]
  }

  const baseItems = [
    { icon: '📊', label: 'Dashboard', path: getDashboardPathForRole(role) },
    { icon: '💪', label: 'My Dashboard', path: '/member-dashboard' },
    { icon: '🔔', label: 'Notifications', path: '/notifications' },
  ]

  const roleSpecificItems: Record<GymRole, Array<{ icon: string; label: string; path: string }>> = {
    SUPER_ADMIN: [
      { icon: '🏢', label: 'Org Hierarchy', path: '/organizations-hierarchy' },
      { icon: '🏢', label: 'Organizations', path: '/organizations' },
      { icon: '👥', label: 'Members', path: '/members' },
      { icon: '💳', label: 'Fees', path: '/fees' },
      { icon: '📋', label: 'Attendance', path: '/attendance' },
      { icon: '🎫', label: 'Membership Plans', path: '/membership-plans' },
      { icon: '🏋️', label: 'Trainers', path: '/trainers' },
      { icon: '👫', label: 'Classes', path: '/classes' },
      { icon: '👤', label: 'User Management', path: '/user-management' },
      { icon: '🛡️', label: 'Role Management', path: '/role-management' },
      { icon: '🏢', label: 'Hierarchy', path: '/hierarchy' },
      { icon: '📊', label: 'Reports', path: '/reports' },
    ],
    ADMIN: [
      { icon: '👥', label: 'Members', path: '/members' },
      { icon: '💳', label: 'Fees', path: '/fees' },
      { icon: '📋', label: 'Attendance', path: '/attendance' },
      { icon: '🎫', label: 'Membership Plans', path: '/membership-plans' },
      { icon: '🏋️', label: 'Trainers', path: '/trainers' },
      { icon: '👫', label: 'Classes', path: '/classes' },
      { icon: '👤', label: 'User Management', path: '/user-management' },
      { icon: '🛡️', label: 'Role Management', path: '/role-management' },
      { icon: '🏢', label: 'Hierarchy', path: '/hierarchy' },
      { icon: '📊', label: 'Reports', path: '/reports' },
    ],
    TRAINER: [
      { icon: '📋', label: 'My Clients', path: '/members?filter=trainer' },
      { icon: '👤', label: 'Team Members', path: '/user-management' },
      { icon: '💪', label: 'Workouts', path: '/workouts' },
      { icon: '📊', label: 'Progress', path: '/progress' },
      { icon: '📅', label: 'Classes', path: '/classes' },
      { icon: '📋', label: 'Workout Plans', path: '/plans' },
    ],
    RECEPTIONIST: [
      { icon: '📋', label: 'Check-In', path: '/attendance' },
      { icon: '👤', label: 'Team Members', path: '/user-management' },
      { icon: '💳', label: 'Fee Collection', path: '/fees' },
      { icon: '👥', label: 'Members', path: '/members' },
      { icon: '🎫', label: 'Memberships', path: '/membership-plans' },
      { icon: '📝', label: 'Registration', path: '/members/new' },
    ],
    USER: [],
  }

  return [...baseItems, ...(roleSpecificItems[role] || [])]
}
