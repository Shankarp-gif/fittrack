# Auto-Adjustment System - Complete Guide

## Overview

The GymTrackPro application now includes a comprehensive **Auto-Adjustment System** that ensures optimal text visibility, contrast, and alignment across both light and dark modes. This system automatically adjusts UI elements to provide the best user experience while maintaining accessibility standards.

## Features

### 1. **Text Visibility Auto-Adjustment**
- Automatically adjusts text colors based on the current theme (light/dark)
- Ensures high contrast ratios for readability (WCAG AA compliance: 4.5:1)
- Applies text rendering optimizations for clarity
- Uses `-webkit-font-smoothing: antialiased` for better text rendering

### 2. **Button Text Auto-Adjustment**
- Primary buttons always display readable text
- Secondary buttons maintain proper contrast
- Icon buttons adapt to theme
- Ghost buttons ensure visibility in both modes
- All buttons use `text-rendering: optimizeLegibility`

### 3. **Input Field Auto-Adjustment**
- Input text color adapts to theme
- Placeholder text is always visible
- Focus states provide clear visual feedback
- Disabled states are properly indicated

### 4. **Page Alignment Auto-Adjustment**
- Content automatically centers or aligns based on screen size
- Dashboard elements properly spaced and aligned
- Responsive grid layouts adjust automatically
- Tables and lists maintain consistent alignment

### 5. **High Contrast Mode**
- Toggle available in Settings page
- Increases font weight and letter spacing
- Enhances visibility for users with vision impairments
- Persisted in local storage

## CSS Variables for Auto-Adjustment

### Primary Variables
```css
--text-auto-primary: Primary text color (adapts to theme)
--text-auto-secondary: Secondary text color (adapts to theme)
--text-auto-tertiary: Tertiary text color (adapts to theme)
--text-high-contrast: High contrast variant
--text-button: Button text color
```

### Dark Mode Colors
- `--text-auto-primary: #f5f7fa` (light text)
- `--text-auto-secondary: #b0b8c8` (medium text)
- `--text-auto-tertiary: #7a8398` (dim text)

### Light Mode Colors
- `--text-auto-primary: #0a0e27` (dark text)
- `--text-auto-secondary: #1a202c` (dark-medium text)
- `--text-auto-tertiary: #2d3748` (dark-dim text)

## Utility Classes

### Text Color Utilities
```html
<!-- Auto-adjusts based on current theme -->
<p class="text-primary">Primary text - most contrast</p>
<p class="text-secondary">Secondary text - medium contrast</p>
<p class="text-tertiary">Tertiary text - lower contrast</p>

<!-- Status colors -->
<p class="text-success">Success message</p>
<p class="text-error">Error message</p>
<p class="text-warning">Warning message</p>
<p class="text-info">Info message</p>
```

### Text Alignment Utilities
```html
<div class="text-center">Centered text</div>
<div class="text-left">Left-aligned text</div>
<div class="text-right">Right-aligned text</div>
<div class="text-justify">Justified text</div>
```

### Flexbox Alignment Utilities
```html
<div class="auto-align">Centered content</div>
<div class="auto-align-start">Start-aligned content</div>
<div class="auto-align-end">End-aligned content</div>
<div class="auto-align-between">Space-between content</div>
```

## TypeScript Utilities

### useTheme Hook
```typescript
const { theme, setTheme, resolvedTheme, highContrast, setHighContrast } = useTheme()
```

### Auto-Adjustment Hooks
```typescript
// Get auto-adjusted text color
const primaryColor = useAutoTextColor('primary')
const secondaryColor = useAutoTextColor('secondary')

// Get auto-adjusted background color
const bgColor = useAutoBackgroundColor('primary')

// Get button text color
const buttonTextColor = useAutoButtonTextColor()

// Get text visibility settings
const { textPrimary, textSecondary, highContrast } = useAutoTextVisibility()

// Get button styling
const buttonStyles = useAutoButtonStyle()
```

### Utility Functions
```typescript
// Calculate contrast ratio (returns number)
const ratio = getContrastRatio('#ffffff', '#000000') // Returns 21

// Check WCAG compliance
const isAccessible = isContrastAccessible('#ffffff', '#666666', false) // Returns true/false

// Get responsive font size
const fontSize = getAutoFontSize(16, window.innerWidth)

// Apply auto-adjustment to elements
applyAutoTextAdjustment(element, 'light')
applyAutoButtonAdjustment(element, 'dark')
```

## Theme Toggle Component

A ready-to-use theme toggle component is available:

```typescript
import { ThemeToggle } from './components/common/ThemeToggle'

export function MyComponent() {
  return <ThemeToggle />
}
```

### Features
- Theme selection (Light/Dark/System)
- High contrast mode toggle
- Current theme display
- Accessibility labels

## Settings Page Integration

The Settings page includes:
- Theme selector dropdown
- Current resolved theme display
- High Contrast Mode toggle
- Description of accessibility benefits

Access at: `/settings` (when logged in)

## CSS Files Organization

### Main Files
- `design-system.css` - Base design tokens and components
- `auto-adjustment.css` - Auto-adjustment rules and utilities
- Individual component CSS files - Component-specific styling

### Key Adjustments in Auto-Adjustment CSS
1. **Text Hierarchy** - Primary, secondary, tertiary text
2. **Button Styling** - All button variants with text adjustments
3. **Form Elements** - Inputs, textareas, selects
4. **Badges & Status** - Status indicators with high contrast
5. **Navigation** - Sidebar and menu items
6. **Tables & Lists** - Tabular data styling
7. **Modals & Dialogs** - Popup content
8. **Accessibility** - Focus states and reduced motion

## Implementation Examples

### Example 1: Using Auto-Text Color
```typescript
import { useAutoTextColor } from '../utils/autoAdjustment'

export function MyComponent() {
  const primaryColor = useAutoTextColor('primary')
  
  return (
    <div style={{ color: primaryColor }}>
      This text will automatically adjust based on theme
    </div>
  )
}
```

### Example 2: Using CSS Variables
```css
.my-component {
  color: var(--text-auto-primary);
  background: var(--bg-secondary);
}

:root[data-theme='light'] .my-component {
  color: #0a0e27;
  background: #ffffff;
}
```

### Example 3: Using Utility Classes
```html
<div class="card">
  <h1 class="text-primary">Title</h1>
  <p class="text-secondary">Description</p>
  <div class="auto-align">
    <button class="btn-primary">Action</button>
  </div>
</div>
```

## Light Mode vs Dark Mode

### Dark Mode (Default)
- Background: `#0a0e27` (very dark blue)
- Primary Text: `#f5f7fa` (light gray)
- Accent: `#00d9ff` (cyan)

### Light Mode
- Background: `#f8f9fc` (light gray)
- Primary Text: `#0a0e27` (very dark blue)
- Accent: `#0088cc` (darker blue)

## Responsive Behavior

The auto-adjustment system includes responsive breakpoints:

### Large Screens (> 1024px)
- Full-size typography
- Multi-column layouts

### Medium Screens (768px - 1024px)
- Slightly reduced font sizes
- Single-column layouts
- Full-width buttons

### Small Screens (480px - 768px)
- Further reduced font sizes
- Optimized spacing
- Mobile-friendly alignments

### Extra Small Screens (< 480px)
- Minimum font sizes (11px)
- Centered content
- Minimal gaps and padding

## Accessibility Features

### WCAG Compliance
- Text contrast ratios meet AA standard (4.5:1 for normal text)
- Focus states clearly visible
- Color not used as only indicator
- Keyboard navigation supported

### Screen Reader Support
- Semantic HTML structure
- ARIA labels where needed
- Proper heading hierarchy
- Alternative text for icons

### Motion Preferences
- Respects `prefers-reduced-motion`
- Animations can be disabled
- No automatic animations on load

## Testing the Auto-Adjustment System

### Test 1: Theme Switching
1. Go to Settings page
2. Switch theme from Light to Dark
3. Verify all text remains readable
4. Check buttons have proper contrast

### Test 2: Text Visibility
1. Open dashboard
2. Check all text is clearly visible
3. Switch to light mode
4. Verify text colors have adjusted

### Test 3: Alignment
1. View dashboard on mobile device
2. Content should be center-aligned
3. Buttons should be full-width or centered
4. Text should not overflow

### Test 4: High Contrast Mode
1. Enable High Contrast in Settings
2. Check page updates immediately
3. Verify text weight increased
4. Confirm spacing adjusted

### Test 5: Accessibility
1. Use keyboard to navigate
2. All interactive elements should be accessible
3. Focus states should be visible
4. Screen reader should read all content

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Common Issues & Solutions

### Issue: Text not visible in light mode
**Solution:** Check that `--text-auto-primary` is set correctly. Should be `#0a0e27` for light mode.

### Issue: Button text not showing
**Solution:** Ensure button has `color: var(--bg-primary)` or explicit white/black text color.

### Issue: Theme not persisting
**Solution:** Check localStorage is enabled. Theme preference is saved as `fittrack_theme`.

### Issue: High contrast not applying
**Solution:** Ensure `setHighContrast` is called. Check `document.documentElement.classList` for `high-contrast`.

## Future Enhancements

Potential improvements for the auto-adjustment system:
1. Color blindness mode (Deuteranopia, Protanopia, Tritanopia)
2. Font size adjustment slider
3. Font family options (serif, sans-serif, monospace)
4. Animation intensity control
5. Custom theme builder
6. Per-component theme overrides

## Support & Feedback

For issues or suggestions regarding the auto-adjustment system:
1. Check this documentation first
2. Review the CSS files for implementation details
3. Check browser console for errors
4. Report issues with theme and color preferences

## Files Modified/Created

### New Files
- `src/styles/auto-adjustment.css` - Main auto-adjustment CSS
- `src/utils/autoAdjustment.ts` - Utility functions and hooks
- `src/components/common/ThemeToggle.tsx` - Theme toggle component
- `src/components/common/ThemeToggle.css` - Theme toggle styles

### Modified Files
- `src/context/ThemeContext.tsx` - Added high contrast support
- `src/pages/SettingsPage.tsx` - Added high contrast toggle
- `src/styles/design-system.css` - Enhanced button and form styling
- `src/pages/DashboardPage.css` - Enhanced text visibility
- `src/App.tsx` - Import auto-adjustment CSS

## Version History

### v1.0 (Current)
- Initial release
- Text visibility auto-adjustment
- Button text auto-adjustment
- Input field auto-adjustment
- Page alignment auto-adjustment
- High contrast mode
- WCAG AA compliance
- Responsive design support
- Theme persistence
- Settings page integration

---

**Last Updated:** September 6, 2026
**System Version:** 1.0
**Auto-Adjustment Features:** Fully Implemented

