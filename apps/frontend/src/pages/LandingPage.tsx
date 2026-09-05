import { Activity, BarChart3, CalendarDays, Dumbbell, Medal, Scale, Target, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicHeader } from '../components/layout/PublicHeader'

const features = [
  { title: 'Workout Tracking', icon: Dumbbell },
  { title: 'Exercise Library', icon: Activity },
  { title: 'Progress Analytics', icon: BarChart3 },
  { title: 'Fitness Goals', icon: Target },
  { title: 'Personal Records', icon: Medal },
  { title: 'Workout Plans', icon: Timer },
  { title: 'Body Measurements', icon: Scale },
  { title: 'Activity History', icon: CalendarDays },
]

export function LandingPage() {
  return (
    <div className="landing">
      <PublicHeader />
      <section className="hero">
        <div>
          <h1>Train Smarter. Get Stronger. Become Your Best.</h1>
          <p>
            Premium fitness tracking for beginners, advanced lifters, and coaches. Build momentum with workouts,
            progress insights, and recovery-aware recommendations.
          </p>
          <div className="row-gap">
            <Link to="/register" className="primary-btn">
              Start Your Fitness Journey
            </Link>
            <a href="#features" className="ghost-btn">
              Explore Features
            </a>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80"
          alt="Athlete training in a gym"
          className="hero-image"
        />
      </section>

      <section id="features" className="feature-grid">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <article className="card" key={feature.title}>
              <Icon />
              <h3>{feature.title}</h3>
            </article>
          )
        })}
      </section>
    </div>
  )
}

