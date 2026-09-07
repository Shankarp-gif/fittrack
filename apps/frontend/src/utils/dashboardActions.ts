import type { GymRole } from '../types/auth'

export interface DashboardLinkAction {
  id: string
  label: string
  path: string
  icon: string
  keywords: string[]
}

export interface TopNavRoleConfig {
  showSearch: boolean
  showQuickAdd: boolean
  quickAddLabel: string
}

const roleQuickAddActions: Record<GymRole, DashboardLinkAction[]> = {
  SUPER_ADMIN: [
    { id: 'member', label: 'Add Member', path: '/members/new', icon: '👤', keywords: ['member', 'user', 'client'] },
    { id: 'fees', label: 'Collect Fees', path: '/fees', icon: '💳', keywords: ['fees', 'fee', 'payment', 'payments', 'billing'] },
    { id: 'attendance', label: 'Mark Attendance', path: '/attendance', icon: '📋', keywords: ['attendance', 'checkin', 'check-in', 'visit'] },
    { id: 'membership', label: 'Membership Plans', path: '/membership-plans', icon: '🎫', keywords: ['membership', 'plan', 'renewal', 'renew', 'freeze', 'unfreeze'] },
    { id: 'reports', label: 'View Reports', path: '/reports', icon: '📊', keywords: ['report', 'reports', 'analytics', 'revenue'] },
    { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙️', keywords: ['setting', 'settings', 'config'] },
  ],
  ADMIN: [
    { id: 'member', label: 'Add Member', path: '/members/new', icon: '👤', keywords: ['member', 'user', 'client'] },
    { id: 'fees', label: 'Collect Fees', path: '/fees', icon: '💳', keywords: ['fees', 'fee', 'payment', 'payments', 'billing'] },
    { id: 'attendance', label: 'Mark Attendance', path: '/attendance', icon: '📋', keywords: ['attendance', 'checkin', 'check-in', 'visit'] },
    { id: 'membership', label: 'Membership Plans', path: '/membership-plans', icon: '🎫', keywords: ['membership', 'plan', 'renewal', 'renew', 'freeze', 'unfreeze'] },
    { id: 'reports', label: 'View Reports', path: '/reports', icon: '📊', keywords: ['report', 'reports', 'analytics', 'revenue'] },
    { id: 'settings', label: 'Settings', path: '/settings', icon: '⚙️', keywords: ['setting', 'settings', 'config'] },
  ],
  TRAINER: [
    { id: 'clients', label: 'Members', path: '/members', icon: '👥', keywords: ['client', 'clients', 'member', 'members'] },
    { id: 'classes', label: 'Classes', path: '/classes', icon: '📅', keywords: ['class', 'classes', 'session', 'sessions'] },
    { id: 'workouts', label: 'Workouts', path: '/workouts', icon: '🏋️', keywords: ['workout', 'workouts', 'exercise', 'program'] },
    { id: 'progress', label: 'Progress', path: '/progress', icon: '📈', keywords: ['progress', 'result', 'results', 'achievement', 'achievements'] },
    { id: 'plans', label: 'Plans', path: '/plans', icon: '🗓️', keywords: ['plan', 'plans', 'schedule'] },
  ],
  GYM_MAINTENANCE_MANAGER: [
    { id: 'register', label: 'Register Member', path: '/members/new', icon: '📝', keywords: ['register', 'registration', 'new member', 'member'] },
    { id: 'members', label: 'Members', path: '/members', icon: '👥', keywords: ['members', 'member list', 'member details'] },
    { id: 'fees', label: 'Collect Payment', path: '/fees', icon: '💳', keywords: ['fees', 'fee', 'payment', 'payments', 'billing'] },
    { id: 'attendance', label: 'Check-In Member', path: '/attendance', icon: '📋', keywords: ['attendance', 'checkin', 'check-in', 'visit'] },
    { id: 'membership', label: 'Membership Plans', path: '/membership-plans', icon: '🎫', keywords: ['membership', 'plan', 'renewal', 'renew', 'freeze', 'unfreeze'] },
  ],
  USER: [
    { id: 'attendance', label: 'Check-In', path: '/attendance', icon: '📋', keywords: ['attendance', 'checkin', 'check-in', 'visit'] },
    { id: 'renew', label: 'Membership', path: '/membership-plans?tab=myMembership', icon: '🎫', keywords: ['membership', 'renew', 'renewal', 'plan', 'freeze', 'unfreeze'] },
    { id: 'workouts', label: 'Workouts', path: '/workouts', icon: '🏋️', keywords: ['workout', 'workouts', 'exercise', 'program'] },
    { id: 'progress', label: 'Progress', path: '/progress', icon: '📈', keywords: ['progress', 'result', 'results', 'achievement', 'achievements'] },
    { id: 'goals', label: 'Goals', path: '/goals', icon: '🎯', keywords: ['goal', 'goals', 'target', 'targets'] },
    { id: 'notifications', label: 'Notifications', path: '/notifications', icon: '🔔', keywords: ['notification', 'notifications', 'alert', 'alerts'] },
  ],
}

const roleDashboardActions: Record<GymRole, DashboardLinkAction[]> = {
  SUPER_ADMIN: roleQuickAddActions.SUPER_ADMIN,
  ADMIN: roleQuickAddActions.ADMIN,
  TRAINER: [
    { id: 'clients', label: 'Members', path: '/members', icon: '👥', keywords: ['client', 'clients', 'member', 'members'] },
    { id: 'workouts', label: 'Workouts', path: '/workouts', icon: '🏋️', keywords: ['workout', 'workouts', 'exercise', 'program'] },
    { id: 'progress', label: 'Progress', path: '/progress', icon: '📈', keywords: ['progress', 'update', 'results'] },
    { id: 'classes', label: 'Classes', path: '/classes', icon: '📅', keywords: ['class', 'session', 'schedule'] },
    { id: 'plans', label: 'Plans', path: '/plans', icon: '🗓️', keywords: ['plan', 'plans', 'program'] },
  ],
  GYM_MAINTENANCE_MANAGER: roleQuickAddActions.GYM_MAINTENANCE_MANAGER,
  USER: roleQuickAddActions.USER,
}

const roleTopNavConfig: Record<GymRole, TopNavRoleConfig> = {
  SUPER_ADMIN: { showSearch: true, showQuickAdd: true, quickAddLabel: 'Quick Add' },
  ADMIN: { showSearch: true, showQuickAdd: true, quickAddLabel: 'Quick Add' },
  TRAINER: { showSearch: true, showQuickAdd: false, quickAddLabel: 'Quick Add' },
  GYM_MAINTENANCE_MANAGER: { showSearch: true, showQuickAdd: true, quickAddLabel: 'Quick Add' },
  USER: { showSearch: false, showQuickAdd: true, quickAddLabel: 'Quick Access' },
}

export function getQuickAddActionsForRole(role: GymRole): DashboardLinkAction[] {
  return roleQuickAddActions[role] ?? []
}

export function getDashboardQuickActionsForRole(role: GymRole): DashboardLinkAction[] {
  return roleDashboardActions[role] ?? []
}

export function getTopNavConfigForRole(role: GymRole): TopNavRoleConfig {
  return roleTopNavConfig[role] ?? { showSearch: true, showQuickAdd: false, quickAddLabel: 'Quick Add' }
}

export function getDashboardSearchPlaceholder(role: GymRole): string {
  switch (role) {
    case 'USER':
      return 'Search membership, workouts, progress...'
    case 'TRAINER':
      return 'Search clients, sessions, workouts...'
    case 'GYM_MAINTENANCE_MANAGER':
      return 'Search members, check-ins, fees...'
    default:
      return 'Search members, fees, plans...'
  }
}

export function resolveDashboardSearchPath(role: GymRole, rawQuery: string): string | null {
  const trimmedQuery = rawQuery.trim()
  if (!trimmedQuery) {
    return null
  }

  const normalizedQuery = trimmedQuery.toLowerCase()
  const matchedAction = (roleQuickAddActions[role] ?? []).find((action) =>
    action.keywords.some((keyword) => normalizedQuery.includes(keyword)),
  )

  if (matchedAction) {
    if (matchedAction.id === 'member' || matchedAction.id === 'members' || matchedAction.id === 'clients' || matchedAction.id === 'register') {
      return `/members?search=${encodeURIComponent(trimmedQuery)}`
    }
    return matchedAction.path
  }

  if (role !== 'USER') {
    return `/members?search=${encodeURIComponent(trimmedQuery)}`
  }

  return null
}
