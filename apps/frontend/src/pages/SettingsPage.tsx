import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { settingsService } from '../services/userService'
import { useTheme } from '../context/ThemeContext'
import type { AppSettings } from '../types/auth'
import { PageLoader } from '../components/common/PageLoader'
import { showToast } from '../components/common/Toast'
import '../styles/settings-page.css'

type ThemeChoice = 'light' | 'dark' | 'system'

const defaultSettings: AppSettings = {
  reminderEnabled: true,
  reminderTime: '07:30',
  unitSystem: 'METRIC',
  weeklyGoal: 4,
}

export function SettingsPage() {
  const { theme, setTheme, resolvedTheme, highContrast, setHighContrast } = useTheme()
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [initialSettings, setInitialSettings] = useState<AppSettings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [weeklyGoalError, setWeeklyGoalError] = useState('')

  useEffect(() => {
    settingsService
      .get()
      .then((data) => {
        setSettings(data)
        setInitialSettings(data)
      })
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false))
  }, [])

  const hasUnsavedChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings)

  function validateForm(): boolean {
    if (!Number.isInteger(settings.weeklyGoal) || settings.weeklyGoal < 1 || settings.weeklyGoal > 14) {
      setWeeklyGoalError('Weekly target must be a whole number between 1 and 14.')
      return false
    }

    setWeeklyGoalError('')
    return true
  }

  function applyQuickPreset(preset: Partial<AppSettings>) {
    setSettings((previous) => ({ ...previous, ...preset }))
  }

  function resetToLastSaved() {
    setSettings(initialSettings)
    setWeeklyGoalError('')
    setError('')
  }

  function resetToDefaults() {
    setSettings(defaultSettings)
    setWeeklyGoalError('')
    setError('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!hasUnsavedChanges) {
      showToast({ message: 'No changes to save.', type: 'info' })
      return
    }

    setSaved(false)
    setError('')
    setSaving(true)

    try {
      const updated = await settingsService.update(settings)
      setSettings(updated)
      setInitialSettings(updated)
      setSaved(true)
      showToast({ message: 'Settings saved successfully.', type: 'success' })
      window.setTimeout(() => setSaved(false), 1500)
    } catch {
      setError('Could not save settings.')
      showToast({ message: 'Could not save settings.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="stack-gap settings-page-wrap">
      <section className="panel settings-hero">
        <div className="settings-hero-head">
          <div>
            <h1>Settings</h1>
            <p className="muted">Adjust app experience, reminders, and display preferences.</p>
          </div>
          <span className={`badge ${hasUnsavedChanges ? 'badge-warning' : 'badge-success'}`}>
            {hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'}
          </span>
        </div>

        <div className="settings-quick-actions">
          <button type="button" className="ghost-btn" onClick={resetToLastSaved} disabled={!hasUnsavedChanges || saving}>
            Undo Changes
          </button>
          <button type="button" className="ghost-btn" onClick={resetToDefaults} disabled={saving}>
            Use Defaults
          </button>
        </div>
      </section>

      <section className="panel stack-gap settings-section">
        <h2>Appearance</h2>
        <div className="profile-grid settings-grid">
          <label>
            Theme
            <select className="search-input" value={theme} onChange={(e) => setTheme(e.target.value as ThemeChoice)}>
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
            <small className="muted">Choose how FitTrack looks across this device.</small>
          </label>
          <article className="card settings-status-card">
            <p className="muted">Resolved theme</p>
            <h3>{resolvedTheme}</h3>
            <p className="muted">High contrast is {highContrast ? 'enabled' : 'disabled'}.</p>
          </article>
          <label className="check-row settings-checkbox-row">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
            />
            <span>
              <strong>High Contrast Mode</strong>
              <small className="muted settings-field-help">Improves text visibility for long sessions.</small>
            </span>
          </label>
        </div>
      </section>

      <section className="panel stack-gap settings-section">
        <h2>Training Preferences</h2>
        <form className="profile-grid settings-grid" onSubmit={handleSubmit}>
          <label className="check-row settings-checkbox-row">
            <input
              type="checkbox"
              checked={settings.reminderEnabled}
              onChange={(e) => setSettings({ ...settings, reminderEnabled: e.target.checked })}
            />
            <span>
              <strong>Daily workout reminder</strong>
              <small className="muted settings-field-help">Send a daily prompt to keep your streak active.</small>
            </span>
          </label>
          <label>
            Reminder time
            <input
              className="search-input"
              type="time"
              value={settings.reminderTime}
              disabled={!settings.reminderEnabled}
              onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
            />
            <small className="muted">Used only when reminder is enabled.</small>
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
            <small className="muted">Applies to measurements shown in your workouts and profile.</small>
          </label>
          <label>
            Weekly target sessions
            <input
              className={`search-input ${weeklyGoalError ? 'settings-input-error' : ''}`}
              type="number"
              min={1}
              max={14}
              value={settings.weeklyGoal}
              onChange={(e) => setSettings({ ...settings, weeklyGoal: Number(e.target.value) })}
            />
            {weeklyGoalError ? <small className="error">{weeklyGoalError}</small> : <small className="muted">Recommended: 3 to 6 sessions weekly.</small>}
          </label>

          <article className="card settings-status-card">
            <p className="muted">Plan summary</p>
            <h3>{settings.weeklyGoal * 4} sessions / month</h3>
            <p className="muted">Reminder {settings.reminderEnabled ? `at ${settings.reminderTime}` : 'is off'}.</p>
          </article>

          <div className="settings-presets" aria-label="Quick weekly goal presets">
            {[3, 4, 5, 6].map((goal) => (
              <button
                key={goal}
                type="button"
                className={`ghost-btn ${settings.weeklyGoal === goal ? 'settings-preset-active' : ''}`}
                onClick={() => applyQuickPreset({ weeklyGoal: goal })}
              >
                {goal} sessions/week
              </button>
            ))}
          </div>

          <div className="row-gap settings-save-row">
            <button className="primary-btn" type="submit" disabled={saving || !hasUnsavedChanges}>
              {saving ? 'Saving...' : 'Save settings'}
            </button>
            {saved ? <p className="success">Saved</p> : null}
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  )
}
