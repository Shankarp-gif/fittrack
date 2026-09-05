import { Link } from 'react-router-dom'

export function PublicHeader() {
  return (
    <header className="public-header">
      <Link to="/" className="brand-link">
        FITTRACK
      </Link>
      <div className="row-gap">
        <Link to="/login" className="ghost-btn">
          Login
        </Link>
        <Link to="/register" className="primary-btn">
          Start Your Fitness Journey
        </Link>
      </div>
    </header>
  )
}

