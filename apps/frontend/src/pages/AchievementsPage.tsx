import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { dashboardService } from '../services/dashboardService'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { DashboardResponse } from '../types/dashboard'

interface Badge {
  id: number
  title: string
  description: string
  unlocked: boolean
  icon?: string
}

export function AchievementsPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAchievementData()
  }, [])

  const fetchAchievementData = async () => {
    setLoading(true)
    try {
      // Fetch dashboard for stats-based badges
      const dashboardData = await dashboardService.getDashboard()
      setDashboard(dashboardData)

      // Try to fetch badges from API
      try {
        const badgesResponse = await api.get('/api/badges').catch(() => null)
        if (badgesResponse?.data) {
          setBadges(badgesResponse.data)
        } else {
          // If API doesn't return badges, compute from dashboard
          computeBadgesFromDashboard(dashboardData)
        }
      } catch (err) {
        // Fallback to computing badges from dashboard
        computeBadgesFromDashboard(dashboardData)
      }
    } catch (err) {
      setError('Could not load achievements.')
      console.error('Error loading achievements:', err)
    } finally {
      setLoading(false)
    }
  }

  const computeBadgesFromDashboard = (dashboardData: DashboardResponse) => {
    const workouts = dashboardData.weeklyStats.weeklyWorkouts
    const calories = dashboardData.weeklyStats.weeklyCalories
    const duration = dashboardData.weeklyStats.weeklyDurationMinutes

    const computedBadges: Badge[] = [
      {
        id: 1,
        title: 'Momentum Starter',
        description: 'Complete 3 workouts in one week.',
        unlocked: workouts >= 3,
        icon: '🔥',
      },
      {
        id: 2,
        title: 'Calorie Crusher',
        description: 'Burn 1500 kcal in one week.',
        unlocked: calories >= 1500,
        icon: '💪',
      },
      {
        id: 3,
        title: 'Time Investor',
        description: 'Train at least 180 minutes this week.',
        unlocked: duration >= 180,
        icon: '⏱️',
      },
      {
        id: 4,
        title: 'Consistency Hero',
        description: 'Log 3 recent sessions.',
        unlocked: dashboardData.recentActivities.length >= 3,
        icon: '🏆',
      },
    ]
    setBadges(computedBadges)
  }

  const handleClaimBadge = async (badgeId: number) => {
    try {
      await api.post(`/api/badges/${badgeId}/claim`)
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Badge Claimed!',
        message: 'You have claimed this achievement badge!',
        type: 'success',
        duration: 4000,
      })
      fetchAchievementData()
    } catch (err) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to claim badge',
        type: 'error',
        duration: 4000,
      })
    }
  }

  if (error) return <div className="panel error">{error}</div>
  if (loading || !dashboard) return <div className="panel">Loading achievements...</div>

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Achievements</h1>
        <p className="muted">Your milestones and badge unlocks based on current activity data.</p>
      </section>

      <section className="card-grid">
        {badges.map((badge) => (
          <article key={badge.id} className={`card achievement-card ${badge.unlocked ? 'unlocked' : ''}`}>
            <div className="row-space">
              <div>
                {badge.icon && <span className="badge-icon">{badge.icon}</span>}
                <h3>{badge.title}</h3>
              </div>
              <span className={badge.unlocked ? 'badge badge-success' : 'badge'}>
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>
            <p className="muted">{badge.description}</p>
            {badge.unlocked && (
              <button
                className="primary-btn"
                onClick={() => handleClaimBadge(badge.id)}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                Claim Badge
              </button>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}

