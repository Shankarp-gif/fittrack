import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import type { ProgressAnalyticsResponse } from '../types/progressAnalytics'

export function ProgressPage() {
  const [analytics, setAnalytics] = useState<ProgressAnalyticsResponse | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    dashboardService
      .getProgressAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Could not load progress analytics.'))
      .finally(() => setLoading(false))
  }, [])

  if (error) return <div className="panel error">{error}</div>
  if (loading || !analytics) return <div className="panel">Loading progress...</div>

  const hasChartData = analytics.labels.length > 0 && analytics.datasets.length > 0
  const avgMinutesPerWorkout =
    analytics.summary.totalWorkouts > 0
      ? Math.round(analytics.summary.totalDurationMinutes / analytics.summary.totalWorkouts)
      : 0

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Progress</h1>
        <p className="muted">Track your weekly consistency, calories, and time under training.</p>
      </section>

      <section className="card-grid">
        <article className="card">
          <p className="muted">Avg session length</p>
          <h3>{avgMinutesPerWorkout} min</h3>
        </article>
        <article className="card">
          <p className="muted">Last 30 days workouts</p>
          <h3>{analytics.summary.totalWorkouts}</h3>
        </article>
        <article className="card">
          <p className="muted">Attendance consistency</p>
          <h3>{analytics.summary.attendance}%</h3>
        </article>
        <article className="card">
          <p className="muted">Goal completion</p>
          <h3>{analytics.summary.progress}%</h3>
        </article>
      </section>

      <section className="panel stack-gap">
        <h2>Progress Timeline</h2>
        {!hasChartData ? (
          <p className="muted">No progress data found yet. Complete workouts to see your trend.</p>
        ) : (
          <div className="stack-gap">
            {analytics.datasets.map((dataset) => (
              <div key={dataset.key}>
                <div className="row-space">
                  <p>{dataset.label}</p>
                  <p>{dataset.values[dataset.values.length - 1] ?? 0}</p>
                </div>
                <div className="muted" style={{ fontSize: '12px' }}>
                  {analytics.labels.join(' | ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

