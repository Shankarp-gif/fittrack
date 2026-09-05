import { useNavigate } from 'react-router-dom'

export function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="panel">
      <h1>Onboarding Wizard</h1>
      <p>Phase 2 onboarding is prepared. Continue to your dashboard for seeded recommendations and activity data.</p>
      <button className="primary-btn" onClick={() => navigate('/dashboard')}>
        Generate Initial Dashboard
      </button>
    </div>
  )
}

