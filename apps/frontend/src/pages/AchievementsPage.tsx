import { useEffect, useMemo, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardResponse } from '../types/dashboard'

interface BadgeRule {
  title: string
  description: string
  unlocked: boolean
}

export function AchievementsPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(setDashboard)
      .catch(() => setError('Could not load achievements.'))
  }, [])

  const badges = useMemo<BadgeRule[]>(() => {
    if (!dashboard) return []

    const workouts = dashboard.weeklyStats.weeklyWorkouts
    const calories = dashboard.weeklyStats.weeklyCalories
    const duration = dashboard.weeklyStats.weeklyDurationMinutes

    return [
      {
        title: 'Momentum Starter',
        description: 'Complete 3 workouts in one week.',
        unlocked: workouts >= 3,
      },
      {
        title: 'Calorie Crusher',
        description: 'Burn 1500 kcal in one week.',
        unlocked: calories >= 1500,
      },
      {
        title: 'Time Investor',
        description: 'Train at least 180 minutes this week.',
        unlocked: duration >= 180,
      },
      {
        title: 'Consistency Hero',
        description: 'Log 3 recent sessions.',
        unlocked: dashboard.recentActivities.length >= 3,
      },
    ]
  }, [dashboard])

  if (error) return <div className="panel error">{error}</div>
  if (!dashboard) return <div className="panel">Loading achievements...</div>

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Achievements</h1>
        <p className="muted">Your milestones and badge unlocks based on current activity data.</p>
      </section>

      <section className="card-grid">
        {badges.map((badge) => (
          <article key={badge.title} className={`card achievement-card ${badge.unlocked ? 'unlocked' : ''}`}>
            <div className="row-space">
              <h3>{badge.title}</h3>
              <span className={badge.unlocked ? 'badge badge-success' : 'badge'}>{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
            </div>
            <p className="muted">{badge.description}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

