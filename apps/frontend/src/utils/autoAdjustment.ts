/* Auto-Adjustment Utility Hooks and Functions */
import React from 'react'
import { useTheme } from '../context/ThemeContext'

/**
 * Hook to get auto-adjusted text color based on theme
 */
export function useAutoTextColor(type: 'primary' | 'secondary' | 'tertiary' = 'primary') {
  const { resolvedTheme } = useTheme()

  const textColorMap = {
    dark: {
      primary: '#f5f7fa',
      secondary: '#b0b8c8',
      tertiary: '#7a8398',
    },
    light: {
      primary: '#0a0e27',
      secondary: '#1a202c',
      tertiary: '#2d3748',
    },
  }

  return textColorMap[resolvedTheme][type]
}

/**
 * Hook to get auto-adjusted background color
 */
export function useAutoBackgroundColor(type: 'primary' | 'secondary' | 'tertiary' = 'primary') {
  const { resolvedTheme } = useTheme()

  const bgColorMap = {
    dark: {
      primary: '#0a0e27',
      secondary: '#111633',
      tertiary: '#1a1f3a',
    },
    light: {
      primary: '#f8f9fc',
      secondary: '#ffffff',
      tertiary: '#f0f3f9',
    },
  }

  return bgColorMap[resolvedTheme][type]
}

/**
 * Hook to get auto-adjusted button text color
 */
export function useAutoButtonTextColor() {
  const { resolvedTheme } = useTheme()
  return resolvedTheme === 'dark' ? '#0a0e27' : '#ffffff'
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
    const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
    const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB
  }

  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio is accessible (WCAG AA standard: 4.5:1 for normal text)
 */
export function isContrastAccessible(color1: string, color2: string, isLargeText = false): boolean {
  const contrast = getContrastRatio(color1, color2)
  const minContrast = isLargeText ? 3 : 4.5
  return contrast >= minContrast
}

/**
 * Get accessibility class based on contrast check
 */
export function getAccessibilityClass(color1: string, color2: string, isLargeText = false): string {
  return isContrastAccessible(color1, color2, isLargeText) ? 'accessible' : 'low-contrast'
}

/**
 * Hook for text visibility auto-adjustment
 */
export function useAutoTextVisibility() {
  const { resolvedTheme, highContrast } = useTheme()

  return {
    textPrimary: resolvedTheme === 'dark' ? '#f5f7fa' : '#0a0e27',
    textSecondary: resolvedTheme === 'dark' ? '#b0b8c8' : '#1a202c',
    textTertiary: resolvedTheme === 'dark' ? '#7a8398' : '#2d3748',
    highContrast,
  }
}

/**
 * Auto-adjust button styling based on theme
 */
export function useAutoButtonStyle() {
  const { resolvedTheme } = useTheme()

  const buttonStyles = {
    primary: {
      backgroundColor: resolvedTheme === 'dark' ? '#00d9ff' : '#0088cc',
      color: resolvedTheme === 'dark' ? '#0a0e27' : '#ffffff',
      hover: {
        backgroundColor: resolvedTheme === 'dark' ? '#00f0ff' : '#006699',
        boxShadow: resolvedTheme === 'dark'
          ? '0 6px 20px rgba(0, 217, 255, 0.4)'
          : '0 6px 20px rgba(0, 136, 204, 0.4)',
      },
    },
    secondary: {
      backgroundColor: resolvedTheme === 'dark' ? '#1a1f3a' : '#f0f3f9',
      color: resolvedTheme === 'dark' ? '#f5f7fa' : '#0a0e27',
      hover: {
        backgroundColor: resolvedTheme === 'dark' ? '#252d4a' : '#e5ecf5',
      },
    },
  }

  return buttonStyles
}

/**
 * Hook for alignment auto-adjustment based on container
 */
export function useAutoAlignment(containerWidth?: number) {
  const optimalAlignment = containerWidth && containerWidth < 640 ? 'center' : 'flex-start'

  return {
    horizontal: optimalAlignment,
    vertical: 'center',
  }
}

/**
 * Get auto-adjusted font size for responsive design
 */
export function getAutoFontSize(baseSize: number, screenWidth: number): number {
  if (screenWidth < 480) {
    return Math.max(baseSize * 0.85, 11) // Minimum 11px
  } else if (screenWidth < 768) {
    return baseSize * 0.9
  } else if (screenWidth < 1024) {
    return baseSize * 0.95
  }
  return baseSize
}

/**
 * Hook for responsive font sizing
 */
export function useAutoFontSize(baseSize: number) {
  const [fontSize, setFontSize] = React.useState(baseSize)

  React.useEffect(() => {
    const updateFontSize = () => {
      setFontSize(getAutoFontSize(baseSize, window.innerWidth))
    }

    window.addEventListener('resize', updateFontSize)
    updateFontSize()

    return () => window.removeEventListener('resize', updateFontSize)
  }, [baseSize])

  return fontSize
}

/**
 * Apply auto-adjustment to text elements
 */
export function applyAutoTextAdjustment(element: HTMLElement, theme: 'light' | 'dark') {
  if (!element) return

  const textColorMap = {
    dark: '#f5f7fa',
    light: '#0a0e27',
  }

  element.style.color = textColorMap[theme]
  element.style.textRendering = 'optimizeLegibility'
  ;(element.style as any).webkitFontSmoothing = 'antialiased'
}

/**
 * Apply auto-adjustment to button elements
 */
export function applyAutoButtonAdjustment(element: HTMLElement, theme: 'light' | 'dark') {
  if (!element) return

  const textColorMap = {
    dark: '#0a0e27',
    light: '#ffffff',
  }

  element.style.color = textColorMap[theme]
  element.style.fontWeight = '700'
  element.style.textRendering = 'optimizeLegibility'
}

/**
 * Get system preference for contrast
 */
export function getSystemContrastPreference(): boolean {
  return window.matchMedia('(prefers-contrast: more)').matches
}

/**
 * Hook to detect system contrast preference
 */
export function useSystemContrastPreference() {
  const [prefersContrast, setPrefersContrast] = React.useState(() =>
    getSystemContrastPreference()
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: more)')
    const handleChange = (e: MediaQueryListEvent) => setPrefersContrast(e.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersContrast
}

/**
 * Auto-adjust content alignment for different screen sizes
 */
export function getAutoContentAlignment(width: number): 'center' | 'flex-start' {
  return width < 640 ? 'center' : 'flex-start'
}

/**
 * Normalize text for better visibility
 */
export function normalizeTextForVisibility(text: string, theme: 'light' | 'dark'): string {
  if (!text) return ''

  // Trim whitespace
  let normalized = text.trim()

  // Convert to proper case for headings in light mode (more readable)
  if (theme === 'light' && normalized.length > 3) {
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  return normalized
}




