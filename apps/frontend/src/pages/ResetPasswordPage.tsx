import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Validate email
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)

    try {
      await axios.post('/api/auth/reset-password', {
        email: email.trim().toLowerCase(),
        newPassword: newPassword,
      })

      setSuccess('Password reset successfully! Redirecting to login...')
      setEmail('')
      setNewPassword('')
      setConfirmPassword('')

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data as { message?: string } | undefined

        if (status === 404) {
          setError('Email not found in our system')
          return
        }

        if (status === 400) {
          setError(data?.message || 'Invalid password format')
          return
        }

        if (data?.message) {
          setError(data.message)
          return
        }
      }

      setError('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Reset Password</h1>
        <p className="subtitle">Enter your email and new password</p>

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter your email"
          required
          disabled={loading}
        />

        <label>New Password</label>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          placeholder="Enter new password (min 6 characters)"
          required
          disabled={loading}
        />

        <label>Confirm Password</label>
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          placeholder="Confirm your password"
          required
          disabled={loading}
        />

        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p>
          Back to <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}

