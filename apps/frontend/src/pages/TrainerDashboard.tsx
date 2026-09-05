import { useState, useEffect } from 'react'
import { Users, Award, Zap, TrendingUp, Calendar, Clock } from 'lucide-react'
import '../styles/TrainerDashboard.css'

interface TrainerStats {
  myClients: number
  activeSessions: number
  totalSessionsThisMonth: number
  clientsProgress: { improved: number; onTrack: number; needsHelp: number }
  upcomingSessions: Array<{
    id: number
    clientName: string
    time: string
    type: string
  }>
  topClients: Array<{
    name: string
    progress: number
    goal: string
  }>
}

export function TrainerDashboard() {
  const [stats, setStats] = useState<TrainerStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockStats: TrainerStats = {
        myClients: 12,
        activeSessions: 3,
        totalSessionsThisMonth: 28,
        clientsProgress: {
          improved: 8,
          onTrack: 3,
          needsHelp: 1,
        },
        upcomingSessions: [
          { id: 1, clientName: 'Raj Kumar', time: '10:00 AM', type: 'Strength Training' },
          { id: 2, clientName: 'Priya Sharma', time: '11:30 AM', type: 'Cardio' },
          { id: 3, clientName: 'Amit Singh', time: '2:00 PM', type: 'Personal Training' },
        ],
        topClients: [
          { name: 'Raj Kumar', progress: 85, goal: 'Build Muscle' },
          { name: 'Priya Sharma', progress: 72, goal: 'Lose Weight' },
          { name: 'Neha Verma', progress: 90, goal: 'Strength' },
        ],
      }
      setStats(mockStats)
      setLoading(false)
    }, 500)
  }, [])

  return (
    <div className="trainer-dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Trainer Dashboard</h1>
          <p className="page-subtitle">Manage your clients and training sessions</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="trainer-stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <Users size={28} />
            </div>
            <div className="stat-content">
              <h3>My Clients</h3>
              <p className="stat-value">{stats.myClients}</p>
              <p className="stat-label">Active training clients</p>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">
              <Zap size={28} />
            </div>
            <div className="stat-content">
              <h3>Active Sessions</h3>
              <p className="stat-value">{stats.activeSessions}</p>
              <p className="stat-label">Sessions today</p>
            </div>
          </div>

          <div className="stat-card success">
            <div className="stat-icon">
              <Calendar size={28} />
            </div>
            <div className="stat-content">
              <h3>Monthly Sessions</h3>
              <p className="stat-value">{stats.totalSessionsThisMonth}</p>
              <p className="stat-label">This month total</p>
            </div>
          </div>

          <div className="stat-card info">
            <div className="stat-icon">
              <TrendingUp size={28} />
            </div>
            <div className="stat-content">
              <h3>Client Progress</h3>
              <p className="stat-value">{stats.clientsProgress.improved}</p>
              <p className="stat-label">Clients improved</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="trainer-content-grid">
        {/* Upcoming Sessions */}
        <div className="sessions-section">
          <div className="section-header">
            <h2>Upcoming Sessions Today</h2>
          </div>

          {loading ? (
            <div className="loading">Loading sessions...</div>
          ) : (
            <div className="sessions-list">
              {stats?.upcomingSessions.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="session-time">
                    <Clock size={20} />
                    <span>{session.time}</span>
                  </div>
                  <div className="session-info">
                    <h4>{session.clientName}</h4>
                    <p>{session.type}</p>
                  </div>
                  <button className="session-action">Start</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Progress */}
        <div className="progress-section">
          <div className="section-header">
            <h2>Client Progress Summary</h2>
          </div>

          {stats && (
            <div className="progress-items">
              <div className="progress-item improved">
                <div className="progress-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="progress-info">
                  <p className="progress-label">Improved</p>
                  <p className="progress-value">{stats.clientsProgress.improved}</p>
                </div>
              </div>

              <div className="progress-item ontrack">
                <div className="progress-icon">
                  <Award size={24} />
                </div>
                <div className="progress-info">
                  <p className="progress-label">On Track</p>
                  <p className="progress-value">{stats.clientsProgress.onTrack}</p>
                </div>
              </div>

              <div className="progress-item help">
                <div className="progress-icon">
                  <Zap size={24} />
                </div>
                <div className="progress-info">
                  <p className="progress-label">Needs Help</p>
                  <p className="progress-value">{stats.clientsProgress.needsHelp}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Clients */}
        <div className="top-clients-section">
          <div className="section-header">
            <h2>Top Performing Clients</h2>
          </div>

          {loading ? (
            <div className="loading">Loading clients...</div>
          ) : (
            <div className="top-clients-list">
              {stats?.topClients.map((client, idx) => (
                <div key={idx} className="top-client-card">
                  <div className="client-rank">#{idx + 1}</div>
                  <div className="client-info">
                    <h4>{client.name}</h4>
                    <p>{client.goal}</p>
                  </div>
                  <div className="client-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${client.progress}%` }}></div>
                    </div>
                    <span className="progress-text">{client.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <div className="section-header">
          <h2>Quick Actions</h2>
        </div>

        <div className="actions-grid">
          <button className="action-card">
            <Users size={24} />
            <span>Add New Client</span>
          </button>
          <button className="action-card">
            <Calendar size={24} />
            <span>Schedule Session</span>
          </button>
          <button className="action-card">
            <TrendingUp size={24} />
            <span>Update Progress</span>
          </button>
          <button className="action-card">
            <Award size={24} />
            <span>Create Workout Plan</span>
          </button>
        </div>
      </div>
    </div>
  )
}

