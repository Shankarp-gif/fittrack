import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { settingsService } from '../services/userService'
import { useTheme } from '../context/ThemeContext'
import type { AppSettings } from '../types/auth'

type ThemeChoice = 'light' | 'dark' | 'system'

const defaultSettings: AppSettings = {
  reminderEnabled: true,
  reminderTime: '07:30',
  unitSystem: 'METRIC',
  weeklyGoal: 4,
}

export function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    settingsService
      .get()
      .then((data) => setSettings(data))
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaved(false)
    setError('')

    try {
      const updated = await settingsService.update(settings)
      setSettings(updated)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 1500)
    } catch {
      setError('Could not save settings.')
    }
  }

  if (loading) return <div className="panel">Loading settings...</div>

  return (
    <div className="stack-gap">
      <section className="panel">
        <h1>Settings</h1>
        <p className="muted">Adjust app experience, reminders, and display preferences.</p>
      </section>

      <section className="panel stack-gap">
        <h2>Appearance</h2>
        <div className="profile-grid">
          <label>
            Theme
            <select className="search-input" value={theme} onChange={(e) => setTheme(e.target.value as ThemeChoice)}>
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>
          <article className="card">
            <p className="muted">Resolved theme</p>
            <h3>{resolvedTheme}</h3>
          </article>
        </div>
      </section>

      <section className="panel stack-gap">
        <h2>Training Preferences</h2>
        <form className="profile-grid" onSubmit={handleSubmit}>
          <label className="check-row">
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={(e) => setSettings({ ...settings, reminderEnabled: e.target.checked })}
            />
            Daily workout reminder
          </label>
          <label>
            Reminder time
            <input
              className="search-input"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
            />
          </label>
          <label>
            Unit system
            <select
              className="search-input"
              value={settings.unitSystem}
              onChange={(e) => setSettings({ ...settings, unitSystem: e.target.value as AppSettings['unitSystem'] })}
            >
              <option value="METRIC">Metric (kg, cm)</option>
              <option value="IMPERIAL">Imperial (lb, ft)</option>
            </select>
          </label>
          <label>
            Weekly target sessions
            <input
              className="search-input"
              type="number"
              min={1}
              max={14}
              value={settings.weeklyGoal}
              onChange={(e) => setSettings({ ...settings, weeklyGoal: Number(e.target.value) })}
            />
          </label>
          <div className="row-gap">
            <button className="primary-btn" type="submit">Save settings</button>
            {saved ? <p>Saved</p> : null}
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  )
}
