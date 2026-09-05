import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await axios.post('/api/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      })

      setSuccess('Email verified! You can now reset your password.')
      setEmail('')
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        navigate('/reset-password')
      }, 2000)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data as { message?: string } | undefined

        if (status === 404) {
          setError('Email not found in our system')
          return
        }

        if (data?.message) {
          setError(data.message)
          return
        }
      }

      setError('Failed to process request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Forgot Password?</h1>
        <p className="subtitle">Enter your email to reset your password</p>

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter your email"
          required
          disabled={loading}
        />

        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Continue'}
        </button>

        <p>
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  )
}

