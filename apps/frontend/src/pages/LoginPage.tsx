import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@fittrack.app')
  const [password, setPassword] = useState('admin123')
  const [rememberSession, setRememberSession] = useState(true)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    try {
      await login({ email: email.trim().toLowerCase(), password, rememberSession })
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data as { message?: string; details?: string[] } | undefined

        if (status === 401) {
          setError('Invalid credentials. Check your email and password.')
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
      }

      setError('Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
         <label>Email</label>
         <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
         <label>Password</label>
         <div className="password-input-wrapper">
           <input
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             type={showPassword ? 'text' : 'password'}
             required
           />
           <button
             type="button"
             className="password-toggle-btn"
             onClick={() => setShowPassword(!showPassword)}
             title={showPassword ? 'Hide password' : 'Show password'}
           >
             {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
           </button>
         </div>
        <label className="check-row">
          <input type="checkbox" checked={rememberSession} onChange={(e) => setRememberSession(e.target.checked)} />
          Remember session
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary-btn" type="submit">
          Login
        </button>
        <p>
          New here? <Link to="/register">Create account</Link>
        </p>
        <p>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </p>
      </form>
    </div>
  )
}
