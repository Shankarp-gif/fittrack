import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  highContrast: boolean
  setHighContrast: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('fittrack_theme') as Theme) ?? 'system')
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('fittrack_high_contrast') === 'true')

  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  useEffect(() => {
    localStorage.setItem('fittrack_theme', theme)
    document.documentElement.dataset.theme = resolvedTheme

    // Apply high contrast mode if enabled
    if (highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [resolvedTheme, theme, highContrast])

  useEffect(() => {
    localStorage.setItem('fittrack_high_contrast', String(highContrast))
  }, [highContrast])

  const value = useMemo(() => ({
    theme,
    setTheme,
    resolvedTheme,
    highContrast,
    setHighContrast
  }), [theme, resolvedTheme, highContrast])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}



