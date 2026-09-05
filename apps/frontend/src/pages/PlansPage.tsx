import { useEffect, useMemo, useState } from 'react'
import { plansService } from '../services/userService'
import type { PlanTemplate } from '../types/auth'

const fallbackTemplates: PlanTemplate[] = [
  { id: 'strength-4', name: 'Strength Builder', daysPerWeek: 4, focus: 'Progressive overload', durationWeeks: 8 },
  { id: 'fatloss-5', name: 'Lean Cut', daysPerWeek: 5, focus: 'Conditioning and calorie burn', durationWeeks: 6 },
  { id: 'balanced-3', name: 'Balanced Fitness', daysPerWeek: 3, focus: 'Mobility and core strength', durationWeeks: 10 },
]

export function PlansPage() {
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<PlanTemplate[]>(fallbackTemplates)
  const [error, setError] = useState('')

  useEffect(() => {
    plansService
      .get()
      .then((response) => {
        setActivePlanId(response.activePlanId)
        setTemplates(response.templates)
      })
      .catch(() => setError('Could not load plans. Showing default templates.'))
  }, [])

  const activePlan = useMemo(() => templates.find((item) => item.id === activePlanId), [activePlanId, templates])

  async function activatePlan(id: string) {
    setError('')
    try {
      const response = await plansService.activate(id)
      setActivePlanId(response.activePlanId)
      setTemplates(response.templates)
    } catch {
      setError('Could not activate plan. Please retry.')
    }
  }

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Workout Plans</h1>
        <p className="muted">Choose a structured plan and keep progression consistent.</p>
      </section>

      {activePlan ? (
        <section className="panel">
          <h2>Active Plan: {activePlan.name}</h2>
          <p className="muted">
            {activePlan.focus} • {activePlan.daysPerWeek} days/week • {activePlan.durationWeeks} weeks
          </p>
        </section>
      ) : null}

      <section className="card-grid">
        {templates.map((plan) => (
          <article key={plan.id} className="card stack-gap">
            <h3>{plan.name}</h3>
            <p className="muted">{plan.focus}</p>
            <p>
              {plan.daysPerWeek} days/week • {plan.durationWeeks} weeks
            </p>
            <button
              className={plan.id === activePlanId ? 'ghost-btn' : 'primary-btn'}
              type="button"
              onClick={() => activatePlan(plan.id)}
            >
              {plan.id === activePlanId ? 'Active' : 'Start plan'}
            </button>
          </article>
        ))}
      </section>

      {error ? <section className="panel error">{error}</section> : null}
    </div>
  )
}
