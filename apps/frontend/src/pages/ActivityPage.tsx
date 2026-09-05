import { useEffect, useMemo, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardResponse } from '../types/dashboard'

export function ActivityPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(setDashboard)
      .catch(() => setError('Could not load activity timeline.'))
  }, [])

  const totals = useMemo(() => {
    if (!dashboard) return null
    return dashboard.recentActivities.reduce(
      (acc, item) => {
        acc.minutes += item.durationMinutes
        acc.calories += item.caloriesBurned
        return acc
      },
      { minutes: 0, calories: 0 },
    )
  }, [dashboard])

  if (error) return <div className="panel error">{error}</div>
  if (!dashboard || !totals) return <div className="panel">Loading activity...</div>

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Activity</h1>
        <p className="muted">Recent training timeline with volume and energy output.</p>
      </section>

      <section className="card-grid">
        <article className="card"><p className="muted">Sessions tracked</p><h3>{dashboard.recentActivities.length}</h3></article>
        <article className="card"><p className="muted">Total minutes</p><h3>{totals.minutes}</h3></article>
        <article className="card"><p className="muted">Total calories</p><h3>{totals.calories}</h3></article>
      </section>

      <section className="panel stack-gap">
        <h2>Timeline</h2>
        {dashboard.recentActivities.map((item) => (
          <article key={`${item.title}-${item.date}`} className="card row-space">
            <div>
              <h3>{item.title}</h3>
              <p className="muted">{item.date}</p>
            </div>
            <p>
              {item.durationMinutes} min • {item.caloriesBurned} kcal
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}

