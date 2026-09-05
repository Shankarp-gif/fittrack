import { useEffect, useMemo, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardResponse } from '../types/dashboard'

function calculatePercent(value: number, target: number) {
  if (target <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)))
}

export function ProgressPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(setDashboard)
      .catch(() => setError('Could not load progress analytics.'))
  }, [])

  const metrics = useMemo(() => {
    if (!dashboard) return null

    const workouts = dashboard.weeklyStats.weeklyWorkouts
    const calories = dashboard.weeklyStats.weeklyCalories
    const duration = dashboard.weeklyStats.weeklyDurationMinutes

    return {
      workouts,
      calories,
      duration,
      avgMinutesPerWorkout: workouts > 0 ? Math.round(duration / workouts) : 0,
      workoutPercent: calculatePercent(workouts, 5),
      caloriePercent: calculatePercent(calories, 2500),
      durationPercent: calculatePercent(duration, 240),
    }
  }, [dashboard])

  if (error) return <div className="panel error">{error}</div>
  if (!metrics) return <div className="panel">Loading progress...</div>

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Progress</h1>
        <p className="muted">Track your weekly consistency, calories, and time under training.</p>
      </section>

      <section className="card-grid">
        <article className="card">
          <p className="muted">Avg session length</p>
          <h3>{metrics.avgMinutesPerWorkout} min</h3>
        </article>
        <article className="card">
          <p className="muted">Weekly workouts</p>
          <h3>{metrics.workouts}</h3>
        </article>
        <article className="card">
          <p className="muted">Weekly calories</p>
          <h3>{metrics.calories} kcal</h3>
        </article>
        <article className="card">
          <p className="muted">Weekly duration</p>
          <h3>{metrics.duration} min</h3>
        </article>
      </section>

      <section className="panel stack-gap">
        <h2>Weekly Targets</h2>
        <div className="stack-gap">
          <div>
            <div className="row-space"><p>Workouts (5 target)</p><p>{metrics.workoutPercent}%</p></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${metrics.workoutPercent}%` }} /></div>
          </div>
          <div>
            <div className="row-space"><p>Calories (2500 kcal target)</p><p>{metrics.caloriePercent}%</p></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${metrics.caloriePercent}%` }} /></div>
          </div>
          <div>
            <div className="row-space"><p>Duration (240 min target)</p><p>{metrics.durationPercent}%</p></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${metrics.durationPercent}%` }} /></div>
          </div>
        </div>
      </section>
    </div>
  )
}

