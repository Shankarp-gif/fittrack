import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { userService } from '../services/userService'
import type { FitnessLevel, Gender, GoalType, UpdateProfileRequest, UserMe } from '../types/auth'

const fitnessOptions: FitnessLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const goalOptions: GoalType[] = [
  'BUILD_MUSCLE',
  'LOSE_FAT',
  'IMPROVE_STRENGTH',
  'IMPROVE_ENDURANCE',
  'IMPROVE_FITNESS',
  'GENERAL_HEALTH',
]
const genderOptions: Gender[] = ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']

function toOptionalNumber(value: string) {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function toFormState(user: UserMe) {
  return {
    fullName: user.fullName ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    gender: user.gender ?? '',
    heightCm: user.heightCm?.toString() ?? '',
    weightKg: user.weightKg?.toString() ?? '',
    fitnessLevel: user.fitnessLevel ?? '',
    primaryGoal: user.primaryGoal ?? '',
    trainingPreference: user.trainingPreference ?? '',
    workoutFrequency: user.workoutFrequency?.toString() ?? '',
  }
}

export function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    heightCm: '',
    weightKg: '',
    fitnessLevel: '',
    primaryGoal: '',
    trainingPreference: '',
    workoutFrequency: '',
  })

  useEffect(() => {
    userService
      .getMe()
      .then((user) => setForm(toFormState(user)))
      .catch(() => setError('Could not load profile.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    const workoutFrequencyValue = toOptionalNumber(form.workoutFrequency)

    const payload: UpdateProfileRequest = {
      fullName: form.fullName.trim() || undefined,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: (form.gender || undefined) as Gender | undefined,
      heightCm: toOptionalNumber(form.heightCm),
      weightKg: toOptionalNumber(form.weightKg),
      fitnessLevel: (form.fitnessLevel || undefined) as FitnessLevel | undefined,
      primaryGoal: (form.primaryGoal || undefined) as GoalType | undefined,
      trainingPreference: form.trainingPreference.trim() || undefined,
      workoutFrequency: workoutFrequencyValue === undefined ? undefined : Math.round(workoutFrequencyValue),
    }

    try {
      const updated = await userService.updateMe(payload)
      setForm(toFormState(updated))
      setMessage('Profile updated successfully.')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; details?: string[] } | undefined
        setError(data?.details?.[0] ?? data?.message ?? 'Could not update profile.')
      } else {
        setError('Could not update profile.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="panel">Loading profile...</div>
  if (error && !form.fullName) return <div className="panel error">{error}</div>

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Profile</h1>
        <p className="muted">Keep your profile up to date for better recommendations.</p>
      </section>

      <section className="panel stack-gap">
        <form className="profile-grid" onSubmit={handleSubmit}>
          <label>
            Full name
            <input className="search-input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </label>
          <label>
            Date of birth
            <input className="search-input" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </label>
          <label>
            Gender
            <select className="search-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              {genderOptions.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          <label>
            Height (cm)
            <input className="search-input" type="number" min={0} value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} />
          </label>
          <label>
            Weight (kg)
            <input className="search-input" type="number" min={0} value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} />
          </label>
          <label>
            Fitness level
            <select className="search-input" value={form.fitnessLevel} onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value })}>
              <option value="">Select</option>
              {fitnessOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label>
            Primary goal
            <select className="search-input" value={form.primaryGoal} onChange={(e) => setForm({ ...form, primaryGoal: e.target.value })}>
              <option value="">Select</option>
              {goalOptions.map((option) => <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          <label>
            Training preference
            <input className="search-input" value={form.trainingPreference} onChange={(e) => setForm({ ...form, trainingPreference: e.target.value })} placeholder="Gym, Home, Hybrid" />
          </label>
          <label>
            Weekly workout frequency
            <input className="search-input" type="number" min={0} max={14} value={form.workoutFrequency} onChange={(e) => setForm({ ...form, workoutFrequency: e.target.value })} />
          </label>
          <div className="row-gap">
            <button className="primary-btn" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
          </div>
        </form>
        {message ? <p>{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  )
}
