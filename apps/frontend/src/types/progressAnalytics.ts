export interface ProgressDataset {
  key: string
  label: string
  values: number[]
}

export interface ProgressAnalyticsResponse {
  labels: string[]
  datasets: ProgressDataset[]
  summary: {
    totalWorkouts: number
    attendance: number
    progress: number
    totalCalories: number
    totalDurationMinutes: number
  }
}

