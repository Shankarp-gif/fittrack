import { useNavigate } from 'react-router-dom'
import { Lock, Home, ArrowLeft } from 'lucide-react'
import '../styles/AccessDenied.css'

export function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <div className="access-denied-container">
      <div className="access-denied-content">
        {/* Animated Background */}
        <div className="animated-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>

        {/* Main Content */}
        <div className="access-denied-card">
          <div className="error-icon">
            <Lock size={80} />
          </div>

          <div className="error-content">
            <h1 className="error-title">Access Denied</h1>
            <p className="error-description">
              You don't have permission to access this page. Your current role doesn't grant you access to this resource.
            </p>

            <div className="role-info">
              <p>If you believe this is an error, please contact your gym administrator.</p>
            </div>

            {/* Action Buttons */}
            <div className="error-actions">
              <button className="btn-primary" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Go Back
              </button>
              <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                <Home size={18} />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

