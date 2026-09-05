import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { goalsService } from '../services/userService'
import type { GoalItem } from '../types/auth'

export function GoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [targetValue, setTargetValue] = useState('10')
  const [unit, setUnit] = useState('workouts')
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString().slice(0, 10))

  const activeCount = useMemo(() => goals.filter((item) => item.status === 'ACTIVE').length, [goals])

  useEffect(() => {
    goalsService
      .list()
      .then(setGoals)
      .catch(() => setError('Could not load goals.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreateGoal(event: FormEvent) {
    event.preventDefault()
    setError('')

    const parsedTarget = Number(targetValue)
    if (!title.trim() || Number.isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Enter a valid title and target value.')
      return
    }

    try {
      const created = await goalsService.create({
        title: title.trim(),
        targetValue: parsedTarget,
        unit: unit.trim() || 'workouts',
        dueDate,
      })
      setGoals((current) => [...current, created])
      setTitle('')
      setTargetValue('10')
      setUnit('workouts')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; details?: string[] } | undefined
        setError(data?.details?.[0] ?? data?.message ?? 'Could not create goal.')
      } else {
        setError('Could not create goal.')
      }
    }
  }

  async function updateProgress(goalId: number, currentValue: number) {
    try {
      const updated = await goalsService.updateProgress(goalId, currentValue)
      setGoals((current) => current.map((goal) => (goal.id === goalId ? updated : goal)))
    } catch {
      setError('Could not update goal progress.')
    }
  }

  if (loading) return <div className="panel">Loading goals...</div>

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Goals</h1>
        <p className="muted">Create measurable targets and track completion week over week.</p>
      </section>

      <section className="card-grid">
        <article className="card"><p className="muted">Total goals</p><h3>{goals.length}</h3></article>
        <article className="card"><p className="muted">Active goals</p><h3>{activeCount}</h3></article>
        <article className="card"><p className="muted">Completed goals</p><h3>{goals.length - activeCount}</h3></article>
      </section>

      <section className="panel stack-gap">
        <h2>Create Goal</h2>
        <form className="inline-form" onSubmit={handleCreateGoal}>
          <input className="search-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" required />
          <input className="search-input" type="number" min={1} value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required />
          <input className="search-input" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit (workouts, km, min)" required />
          <input className="search-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          <button className="primary-btn" type="submit">Add Goal</button>
        </form>
      </section>

      <section className="panel stack-gap">
        <h2>Goal Progress</h2>
        {goals.map((goal) => {
          const percent = goal.targetValue > 0 ? Math.round((goal.currentValue / goal.targetValue) * 100) : 0
          return (
            <article key={goal.id} className="card stack-gap">
              <div className="row-space">
                <h3>{goal.title}</h3>
                <span className={goal.status === 'COMPLETE' ? 'badge badge-success' : 'badge'}>{goal.status}</span>
              </div>
              <p className="muted">Due: {goal.dueDate}</p>
              <p>{goal.currentValue} / {goal.targetValue} {goal.unit}</p>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }} /></div>
              <input
                className="search-input"
                type="range"
                min={0}
                max={goal.targetValue}
                value={goal.currentValue}
                onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
              />
            </article>
          )
        })}
        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  )
}
