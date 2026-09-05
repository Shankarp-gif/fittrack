export interface Exercise {
  id: number
  name: string
  muscleGroup: string
  equipment: string
  difficulty: string
  instructions: string
  imageUrl?: string
  recommendedSets?: number
  recommendedReps?: number
}

export interface PagedResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

