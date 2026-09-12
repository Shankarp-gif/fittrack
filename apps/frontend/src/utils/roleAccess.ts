/**
 * Role-Based Access Control Utilities
 */

import type { GymRole } from '../types/auth'

/**
 * Role Hierarchy and Permissions
 */
export const ROLE_HIERARCHY: Record<GymRole, number> = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  TRAINER: 2,
  GYM_MAINTENANCE_MANAGER: 1,
  USER: 0,
}

export const ROLE_LABELS: Record<GymRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Gym Owner',
  TRAINER: 'Trainer',
  GYM_MAINTENANCE_MANAGER: 'Gym Maintenance Manager',
  USER: 'Member',
}

export const ROLE_DESCRIPTIONS: Record<GymRole, string> = {
  SUPER_ADMIN: 'Platform-level access - Manage all gyms and system-level settings',
  ADMIN: 'Full system access - Manage all gym operations',
  TRAINER: 'Trainer account - Manage training sessions and member progress',
  GYM_MAINTENANCE_MANAGER: 'Operations staff - Handle check-ins, registrations, and fee support',
  USER: 'Gym member - Track workouts and personal progress',
}

/**
 * Page Access Control
 * Define which roles can access which pages
 */
export const PAGE_ACCESS: Record<string, GymRole[]> = {
  '/dashboard': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER'],
  '/superadmin-dashboard': ['SUPER_ADMIN'],
  '/admin-dashboard': ['SUPER_ADMIN', 'ADMIN'],
  '/trainer-dashboard': ['SUPER_ADMIN', 'ADMIN', 'TRAINER'],
  '/gym-operations-dashboard': ['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER'],
  '/receptionist-dashboard': ['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER'],
  '/member-dashboard': ['USER'],
  '/attendance': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER', 'USER'],
  '/fees': ['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER'],
  '/membership-plans': ['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER', 'USER'],
  '/members': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER'],
  '/members/new': ['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER'],
  '/trainers': ['SUPER_ADMIN', 'ADMIN'],
  '/classes': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER'],
  '/reports': ['SUPER_ADMIN', 'ADMIN'],
  '/workouts': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'USER'],
  '/progress': ['SUPER_ADMIN', 'ADMIN', 'USER', 'TRAINER'],
  '/goals': ['SUPER_ADMIN', 'ADMIN', 'USER', 'TRAINER'],
  '/notifications': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER', 'USER'],
  '/user-management': ['SUPER_ADMIN', 'ADMIN', 'GYM_MAINTENANCE_MANAGER'],
  '/settings': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'GYM_MAINTENANCE_MANAGER', 'USER'],
  '/plans': ['SUPER_ADMIN', 'ADMIN', 'TRAINER', 'USER'],
   '/hierarchy': ['SUPER_ADMIN', 'ADMIN'],
   '/hierarchy-audit': ['SUPER_ADMIN', 'ADMIN'],
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
    case 'GYM_MAINTENANCE_MANAGER':
      return '/gym-operations-dashboard'
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
      { icon: '🩺', label: 'Hierarchy Audit', path: '/hierarchy-audit' },
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
      { icon: '🩺', label: 'Hierarchy Audit', path: '/hierarchy-audit' },
      { icon: '📊', label: 'Reports', path: '/reports' },
    ],
    TRAINER: [
      { icon: '📋', label: 'My Clients', path: '/members?filter=trainer' },
      { icon: '💪', label: 'Workouts', path: '/workouts' },
      { icon: '📊', label: 'Progress', path: '/progress' },
      { icon: '📅', label: 'Classes', path: '/classes' },
      { icon: '📋', label: 'Workout Plans', path: '/plans' },
    ],
    GYM_MAINTENANCE_MANAGER: [
      { icon: '📋', label: 'Check-In', path: '/attendance' },
      { icon: '👤', label: 'Operations Desk', path: '/user-management' },
      { icon: '💳', label: 'Fee Collection', path: '/fees' },
      { icon: '👥', label: 'Members', path: '/members' },
      { icon: '🎫', label: 'Memberships', path: '/membership-plans' },
      { icon: '📝', label: 'Registration', path: '/members/new' },
    ],
    USER: [],
  }

  return [...baseItems, ...(roleSpecificItems[role] || [])]
}
