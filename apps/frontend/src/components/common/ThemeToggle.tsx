import { useTheme } from '../../context/ThemeContext'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, highContrast, setHighContrast } = useTheme()

  const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: string }> = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ]

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-group">
        <label htmlFor="theme-select" className="theme-toggle-label">
          Theme
        </label>
        <select
          id="theme-select"
          className="theme-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          aria-label="Select application theme"
        >
          {themeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
        <span className="theme-info">Current: {resolvedTheme}</span>
      </div>

      <div className="theme-toggle-group">
        <label htmlFor="high-contrast-toggle" className="theme-toggle-label">
          Accessibility
        </label>
        <label className="high-contrast-checkbox">
          <input
            id="high-contrast-toggle"
            type="checkbox"
            checked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
            aria-label="Toggle high contrast mode for improved text visibility"
          />
          <span className="checkbox-text">High Contrast Mode</span>
        </label>
        <p className="contrast-description">
          Improves text readability and visibility for better accessibility
        </p>
      </div>
    </div>
  )
}

