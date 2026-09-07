import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { FitnessLevel, GoalType } from '../types/auth'

interface Organization {
  id: number
  name: string
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    mobile: '',
    address: '',
    fitnessLevel: 'BEGINNER' as FitnessLevel,
    goal: 'GENERAL_HEALTH' as GoalType,
    organizationId: '',
  })

  useEffect(() => {
    fetchOrganizations()
  }, [])

  async function fetchOrganizations() {
    try {
      setLoading(true)
      const response = await axios.get('/api/auth/organizations')
      setOrganizations(response.data)
      if (response.data.length > 0) {
        setForm(prev => ({ ...prev, organizationId: response.data[0].id.toString() }))
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err)
      setError('Failed to load organizations. Please refresh and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.organizationId) {
      setError('Please select an organization')
      return
    }

    try {
      await register({
        ...form,
        email: form.email.trim().toLowerCase(),
        organizationId: parseInt(form.organizationId, 10),
      })
      navigate('/onboarding')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data as { message?: string; details?: string[] } | undefined

        if (!err.response) {
          setError('Cannot reach server. Check backend is running and CORS allows this frontend origin.')
          return
        }

        if (status === 409) {
          setError('This email is already registered. Please login or use another email.')
          return
        }

        if (data?.details?.length) {
          setError(data.details[0])
          return
        }

        if (data?.message) {
          setError(data.message)
          return
        }

        setError(`Registration failed (HTTP ${status}). Please verify your data and retry.`)
        return
      }

      setError('Registration failed. Please verify your data and retry.')
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Loading organizations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create your account</h1>
        <label>Organization *</label>
        <select
          value={form.organizationId}
          onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
          required
        >
          <option value="">Select an organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
        <label>Name</label>
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input
          type="password"
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <label>Mobile Number (Optional)</label>
        <input
          type="tel"
          value={form.mobile}
          onChange={(e) => setForm({ ...form, mobile: e.target.value })}
          placeholder="e.g., +1-234-567-8900"
        />
        <label>Address (Optional)</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="e.g., 123 Main St, City, State"
        />
        <label>Fitness Level</label>
        <select
          value={form.fitnessLevel}
          onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value as FitnessLevel })}
        >
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </select>
        <label>Primary Goal</label>
        <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value as GoalType })}>
          <option value="BUILD_MUSCLE">Build Muscle</option>
          <option value="LOSE_FAT">Lose Fat</option>
          <option value="IMPROVE_STRENGTH">Improve Strength</option>
          <option value="IMPROVE_ENDURANCE">Improve Endurance</option>
          <option value="IMPROVE_FITNESS">Improve Fitness</option>
          <option value="GENERAL_HEALTH">General Health</option>
        </select>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary-btn" type="submit">
          Register
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}
