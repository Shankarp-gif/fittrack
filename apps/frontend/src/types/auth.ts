export type FitnessLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type GoalType =
  | 'BUILD_MUSCLE'
  | 'LOSE_FAT'
  | 'IMPROVE_STRENGTH'
  | 'IMPROVE_ENDURANCE'
  | 'IMPROVE_FITNESS'
  | 'GENERAL_HEALTH'

export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY'

/**
 * Gym Role Types
 * - SUPER_ADMIN: Platform-level admin - Full global access
 * - ADMIN: Gym Owner/Manager - Full system access
 * - TRAINER: Fitness Trainer - Training, member management
 * - GYM_MAINTENANCE_MANAGER: Front desk and operations - check-ins, member support, fees
 * - USER: Gym Member - Workout tracking, personal dashboard
 */
export type GymRole = 'SUPER_ADMIN' | 'ADMIN' | 'TRAINER' | 'GYM_MAINTENANCE_MANAGER' | 'USER'

// For backward compatibility
export type UserRole = GymRole

export interface UserMe {
  id: number
  employeeIdNumber?: string
  fullName: string
  email: string
  mobile?: string
  address?: string
  role: GymRole
  organizationId?: number
  organizationName?: string
  branchId?: number
  branchName?: string
  supervisorId?: number
  supervisorName?: string
  dateOfBirth?: string
  gender?: Gender
  heightCm?: number
  weightKg?: number
  fitnessLevel?: FitnessLevel
  primaryGoal?: GoalType
  trainingPreference?: string
  workoutFrequency?: number
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresInSeconds: number
  user: UserMe
}

export interface LoginRequest {
  email: string
  password: string
  rememberSession: boolean
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
  mobile?: string
  address?: string
  dateOfBirth?: string
  gender?: Gender
  heightCm?: number
  weightKg?: number
  fitnessLevel: FitnessLevel
  goal: GoalType
  trainingPreference?: string
  workoutFrequency?: number
  organizationId: number
}

export interface UpdateProfileRequest {
  fullName?: string
  mobile?: string
  address?: string
  dateOfBirth?: string
  gender?: Gender
  heightCm?: number
  weightKg?: number
  fitnessLevel?: FitnessLevel
  primaryGoal?: GoalType
  trainingPreference?: string
  workoutFrequency?: number
}

export interface GoalItem {
  id: number
  title: string
  targetValue: number
  currentValue: number
  unit: string
  dueDate: string
  status: 'ACTIVE' | 'COMPLETE'
}

export interface CreateGoalRequest {
  title: string
  targetValue: number
  unit: string
  dueDate: string
}

export interface PlanTemplate {
  id: string
  name: string
  daysPerWeek: number
  focus: string
  durationWeeks: number
}

export interface PlansResponse {
  activePlanId: string | null
  templates: PlanTemplate[]
}

export interface AppSettings {
  reminderEnabled: boolean
  reminderTime: string
  unitSystem: 'METRIC' | 'IMPERIAL'
  weeklyGoal: number
}
