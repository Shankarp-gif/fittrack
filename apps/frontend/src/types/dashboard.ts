export interface DashboardResponse {
  userSummary: {
    fullName: string
    fitnessLevel: string
    primaryGoal: string
  }
  weeklyStats: {
    weeklyWorkouts: number
    weeklyCalories: number
    weeklyDurationMinutes: number
  }
  todayWorkout: {
    title: string
    estimatedDurationMinutes: number
    estimatedCalories: number
    difficulty: string
  }
  recentActivities: Array<{
    title: string
    date: string
    durationMinutes: number
    caloriesBurned: number
  }>
}

