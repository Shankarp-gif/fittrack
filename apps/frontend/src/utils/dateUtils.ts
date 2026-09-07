/**
 * Date Utilities - Handle Invalid and Null Dates
 */

/**
 * Format date safely, handling null/invalid dates
 */
export function formatDateSafely(date: string | Date | null | undefined): string {
  if (!date) return 'Invalid Date'

  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date

    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date'
    }

    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

/**
 * Format datetime with time
 */
export function formatDateTimeSafely(date: string | Date | null | undefined): string {
  if (!date) return 'Invalid Date'

  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date

    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date'
    }

    return parsedDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'Unknown'

  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date

    if (isNaN(parsedDate.getTime())) {
      return 'Invalid Date'
    }

    const now = new Date()
    const diffMs = now.getTime() - parsedDate.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`
    return `${Math.floor(diffDays / 365)}y ago`
  } catch (error) {
    return 'Unknown'
  }
}

/**
 * Validate if date is valid
 */
export function isValidDate(date: any): boolean {
  if (!date) return false
  try {
    const parsedDate = typeof date === 'string' ? new Date(date) : date
    return !isNaN(parsedDate.getTime())
  } catch {
    return false
  }
}

/**
 * Get current date in ISO format (safe for databases)
 */
export function getCurrentDateIso(): string {
  return new Date().toISOString()
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Get date difference in days
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Format date for API calls
 */
export function formatDateForAPI(date: Date | null): string | null {
  if (!date) return null
  return date.toISOString()
}

/**
 * Parse date from API response safely
 */
export function parseDateFromAPI(dateString: string | null): Date | null {
  if (!dateString) return null
  try {
    const parsed = new Date(dateString)
    return isNaN(parsed.getTime()) ? null : parsed
  } catch {
    return null
  }
}

