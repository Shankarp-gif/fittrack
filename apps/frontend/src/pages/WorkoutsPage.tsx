import { useEffect, useState } from 'react'
import { dashboardService } from '../services/dashboardService'
import { showCenteredSuccessModal } from '../components/common/CenteredSuccessModal'
import type { DashboardResponse } from '../types/dashboard'

export function WorkoutsPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    dashboardService
      .getDashboard()
      .then(setDashboard)
      .catch(() => setError('Could not load workouts overview.'))
  }, [])

  const handleStartWorkout = async () => {
    if (!dashboard?.todayWorkout) return

    setIsStarting(true)
    try {
      // Call API to start workout
      await dashboardService.startWorkout(dashboard.todayWorkout.title)

      showCenteredSuccessModal({
        isOpen: true,
        title: 'Workout Started!',
        message: `Started: ${dashboard.todayWorkout.title}`,
        type: 'success',
        duration: 4000,
      })
    } catch (err) {
      showCenteredSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to start workout',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setIsStarting(false)
    }
  }

  const handleViewDetails = () => {
    if (!dashboard?.todayWorkout) return

    showCenteredSuccessModal({
      isOpen: true,
      title: dashboard.todayWorkout.title,
      message: `Duration: ${dashboard.todayWorkout.estimatedDurationMinutes} min | Calories: ${dashboard.todayWorkout.estimatedCalories} kcal | Difficulty: ${dashboard.todayWorkout.difficulty}`,
      type: 'info',
      duration: 5000,
    })
  }

  if (error) return <div className="panel error">{error}</div>
  if (!dashboard) return <div className="panel">Loading workouts...</div>

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Workouts</h1>
        <p className="muted">Plan your week and stay consistent with your training rhythm.</p>
      </section>

      <section className="card-grid">
        <article className="card">
          <p className="muted">Weekly workouts</p>
          <h3>{dashboard.weeklyStats.weeklyWorkouts}</h3>
        </article>
        <article className="card">
          <p className="muted">Weekly duration</p>
          <h3>{dashboard.weeklyStats.weeklyDurationMinutes} min</h3>
        </article>
        <article className="card">
          <p className="muted">Weekly calories</p>
          <h3>{dashboard.weeklyStats.weeklyCalories} kcal</h3>
        </article>
        <article className="card">
          <p className="muted">Current streak</p>
          <h3>{Math.min(dashboard.recentActivities.length, 7)} days</h3>
        </article>
      </section>

      <section className="panel stack-gap">
        <h2>Today&apos;s Workout</h2>
        <p>
          {dashboard.todayWorkout.title} - {dashboard.todayWorkout.estimatedDurationMinutes} min -{' '}
          {dashboard.todayWorkout.estimatedCalories} kcal - {dashboard.todayWorkout.difficulty}
        </p>
        <div className="row-gap">
          <button
            className="primary-btn"
            type="button"
            onClick={handleStartWorkout}
            disabled={isStarting}
          >
            {isStarting ? 'Starting...' : 'Start Workout'}
          </button>
          <button className="ghost-btn" type="button" onClick={handleViewDetails}>
            View Details
          </button>
        </div>
      </section>

      <section className="panel stack-gap">
        <h2>Recent Sessions</h2>
        {dashboard.recentActivities.map((activity) => (
          <article key={`${activity.title}-${activity.date}`} className="card row-space">
            <p>{activity.title}</p>
            <p className="muted">
              {activity.date} - {activity.durationMinutes} min - {activity.caloriesBurned} kcal
            </p>
          </article>
        ))}
      </section>
    </div>
  )
}

