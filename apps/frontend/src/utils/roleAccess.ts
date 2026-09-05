/**
 * Role-Based Access Control Utilities
 */

import type { GymRole } from '../types/auth'

/**
 * Role Hierarchy and Permissions
 */
export const ROLE_HIERARCHY: Record<GymRole, number> = {
  ADMIN: 4,
  TRAINER: 3,
  RECEPTIONIST: 2,
  USER: 1,
}

export const ROLE_LABELS: Record<GymRole, string> = {
  ADMIN: 'Gym Owner',
  TRAINER: 'Trainer',
  RECEPTIONIST: 'Receptionist',
  USER: 'Member',
}

export const ROLE_DESCRIPTIONS: Record<GymRole, string> = {
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
  '/dashboard': ['ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER'],
  '/admin-dashboard': ['ADMIN'],
  '/trainer-dashboard': ['ADMIN', 'TRAINER'],
  '/receptionist-dashboard': ['ADMIN', 'RECEPTIONIST'],
  '/member-dashboard': ['ADMIN', 'USER'],
  '/attendance': ['ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER'],
  '/fees': ['ADMIN', 'RECEPTIONIST'],
  '/membership-plans': ['ADMIN', 'USER'],
  '/members': ['ADMIN', 'TRAINER', 'RECEPTIONIST'],
  '/trainers': ['ADMIN'],
  '/classes': ['ADMIN', 'TRAINER', 'RECEPTIONIST'],
  '/workouts': ['TRAINER', 'USER'],
  '/progress': ['USER', 'TRAINER'],
  '/user-management': ['ADMIN'],
  '/settings': ['ADMIN', 'TRAINER', 'RECEPTIONIST', 'USER'],
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
  const baseItems = [
    { icon: '📊', label: 'Dashboard', path: getDashboardPathForRole(role) },
  ]

  const roleSpecificItems: Record<GymRole, any[]> = {
    ADMIN: [
      { icon: '👔', label: 'Admin Dashboard', path: '/admin-dashboard' },
      { icon: '👥', label: 'Members', path: '/members' },
      { icon: '💳', label: 'Fees', path: '/fees' },
      { icon: '📋', label: 'Attendance', path: '/attendance' },
      { icon: '🎫', label: 'Membership Plans', path: '/membership-plans' },
      { icon: '🏋️', label: 'Trainers', path: '/trainers' },
      { icon: '👫', label: 'Classes', path: '/classes' },
      { icon: '👤', label: 'User Management', path: '/user-management' },
      { icon: '📊', label: 'Reports', path: '/reports' },
    ],
    TRAINER: [
      { icon: '🏋️', label: 'My Training', path: '/trainer-dashboard' },
      { icon: '📋', label: 'My Clients', path: '/members?filter=trainer' },
      { icon: '💪', label: 'Workouts', path: '/workouts' },
      { icon: '📊', label: 'Progress', path: '/progress' },
      { icon: '📅', label: 'Classes', path: '/classes' },
    ],
    RECEPTIONIST: [
      { icon: '🎫', label: 'Receptionist', path: '/receptionist-dashboard' },
      { icon: '📋', label: 'Check-In', path: '/attendance' },
      { icon: '💳', label: 'Fee Collection', path: '/fees' },
      { icon: '👥', label: 'Members', path: '/members' },
      { icon: '🎫', label: 'Memberships', path: '/membership-plans' },
      { icon: '📝', label: 'Registration', path: '/members/new' },
    ],
    USER: [
      { icon: '💪', label: 'My Dashboard', path: '/member-dashboard' },
      { icon: '📋', label: 'Check-In', path: '/attendance' },
      { icon: '🎫', label: 'My Membership', path: '/membership-plans' },
      { icon: '💪', label: 'Workouts', path: '/workouts' },
      { icon: '📊', label: 'Progress', path: '/progress' },
      { icon: '🎯', label: 'Goals', path: '/goals' },
    ],
  }

  return [...baseItems, ...(roleSpecificItems[role] || [])]
}

