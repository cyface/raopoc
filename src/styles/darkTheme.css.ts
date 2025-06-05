import { createTheme } from '@vanilla-extract/css'
import { vars } from './theme.css'

// Re-export all base theme styles
export * from './theme.css'

// Create dark theme by overriding the theme variables
export const darkTheme = createTheme(vars, {
  color: {
    primary: '#3b82f6',
    primaryHover: '#60a5fa',
    secondary: '#94a3b8',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceHover: '#334155',
    border: '#334155',
    borderLight: '#475569',
    borderHover: '#60a5fa',
    borderFocus: '#3b82f6',
    selectedBg: '#1e3a8a',
    error: '#ef5350',
    success: '#10b981',
    disabled: '#64748b',
    icon: '#60a5fa',
    white: '#ffffff',
  }
})