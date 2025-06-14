import { createTheme } from '@vanilla-extract/css'
import { vars } from './theme.css'

// Re-export all base theme styles
export * from './theme.css'

// Create orange theme by overriding the theme variables
export const orangeLightTheme = createTheme(vars, {
  color: {
    primary: '#ea580c',          // Vibrant orange
    primaryHover: '#c2410c',     // Darker orange
    secondary: '#f97316',        // Medium orange  
    textPrimary: '#7c2d12',      // Dark orange-brown text
    textSecondary: '#9a3412',    // Medium orange-brown text
    textMuted: '#6b7280',        // Keep muted text readable
    background: '#fff7ed',       // Very light orange tint
    surface: '#ffffff',          // White surface
    surfaceHover: '#fef3c7',     // Light orange hover
    border: '#fed7aa',           // Light orange border
    borderLight: '#fed7aa',      // Light orange border
    borderHover: '#fb923c',      // Orange accent hover
    borderFocus: '#ea580c',      // Orange focus
    selectedBg: '#ffedd5',       // Light orange selected
    error: '#dc2626',            // Keep red for errors
    warning: '#ea580c',          // Orange warning (matches primary)
    success: '#16a34a',          // Green success
    disabled: '#d4a574',         // Light orange-tan for disabled
    icon: '#ea580c',             // Orange icons
    white: '#ffffff',            // White
    overlay: 'rgba(0, 0, 0, 0.75)', // Dark overlay
  }
})

// Create dark orange theme
export const orangeDarkTheme = createTheme(vars, {
  color: {
    primary: '#fb923c',          // Lighter orange for dark theme
    primaryHover: '#fdba74',     // Even lighter orange
    secondary: '#f97316',        // Medium orange
    textPrimary: '#fef3c7',      // Light orange-cream text
    textSecondary: '#fed7aa',    // Medium orange-cream
    textMuted: '#fbbf24',        // Muted orange
    background: '#1c0f08',       // Very dark orange-black
    surface: '#2d1810',          // Dark orange-brown surface
    surfaceHover: '#451a03',     // Lighter dark orange hover
    border: '#7c2d12',           // Dark orange border
    borderLight: '#7c2d12',      // Dark orange border
    borderHover: '#fb923c',      // Light orange hover
    borderFocus: '#fb923c',      // Light orange focus
    selectedBg: '#92400e',       // Medium dark orange selected
    error: '#ef5350',            // Light red for dark theme
    warning: '#fb923c',          // Orange warning (matches primary)
    success: '#4ade80',          // Light green success
    disabled: '#92400e',         // Muted orange for disabled in dark theme
    icon: '#fb923c',             // Light orange icons
    white: '#ffffff',            // White
    overlay: 'rgba(0, 0, 0, 0.85)', // Dark overlay
  }
})