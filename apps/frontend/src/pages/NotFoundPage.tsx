import { Link } from 'react-router-dom'
import { AlertCircle, Home, ArrowRight } from 'lucide-react'
import '../styles/NotFoundPage.css'

export function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        {/* Animated Background Elements */}
        <div className="animated-bg">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>

        {/* Main Content */}
        <div className="not-found-card">
          {/* Error Icon */}
          <div className="error-icon">
            <AlertCircle size={80} />
            <div className="error-code">404</div>
          </div>

          {/* Text Content */}
          <div className="error-content">
            <h1 className="error-title">Page Not Found</h1>
            <p className="error-description">
              Oops! We couldn't find the page you're looking for. It might have been moved or deleted.
            </p>

            {/* Navigation Buttons */}
            <div className="error-actions">
              <Link to="/" className="btn-primary">
                <Home size={18} />
                Back to Home
                <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                Go to Dashboard
              </Link>
            </div>
          </div>

          {/* Additional Help Info */}
          <div className="error-help">
            <p>Need help? <a href="mailto:support@fitnesstrackpro.com">Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

