import { createTheme } from '@vanilla-extract/css'
import { vars } from './theme.css'

// Re-export all base theme styles
export * from './theme.css'

// Create green theme by overriding the theme variables
export const greenLightTheme = createTheme(vars, {
  color: {
    primary: '#1b5e20',          // Deep forest green
    primaryHover: '#0d3d11',     // Darker green
    secondary: '#2e7d32',        // Medium green  
    textPrimary: '#1b5e20',      // Dark green text
    textSecondary: '#2e7d32',    // Medium green text
    textMuted: '#4a4a4a',        // Keep muted text readable
    background: '#f8fdf8',       // Very light green tint
    surface: '#ffffff',          // White surface
    surfaceHover: '#f1f8e9',     // Light green hover
    border: '#c8e6c9',           // Light green border
    borderLight: '#c8e6c9',      // Light green border
    borderHover: '#4caf50',      // Green accent hover
    borderFocus: '#1b5e20',      // Dark green focus
    selectedBg: '#e8f5e8',       // Light green selected
    error: '#d32f2f',            // Keep red for errors
    warning: '#f57c00',          // Orange warning for contrast
    success: '#4caf50',          // Green success
    disabled: '#81a881',         // Light green-gray for disabled
    icon: '#1b5e20',             // Dark green icons
    white: '#ffffff',            // White
    overlay: 'rgba(0, 0, 0, 0.75)', // Dark overlay
  }
})

// Create dark green theme
export const greenDarkTheme = createTheme(vars, {
  color: {
    primary: '#66bb6a',          // Lighter green for dark theme
    primaryHover: '#81c784',     // Even lighter green
    secondary: '#4caf50',        // Medium green
    textPrimary: '#e8f5e8',      // Light green-white text
    textSecondary: '#c8e6c9',    // Medium green-white
    textMuted: '#a5d6a7',        // Muted green
    background: '#0a1a0a',       // Very dark green-black
    surface: '#1a2e1a',          // Dark green surface
    surfaceHover: '#304030',     // Lighter dark green hover
    border: '#2e5d2e',           // Medium dark green border
    borderLight: '#2e5d2e',      // Medium dark green border
    borderHover: '#66bb6a',      // Light green hover
    borderFocus: '#66bb6a',      // Light green focus
    selectedBg: '#3e7b3e',       // Medium dark green selected
    error: '#ef5350',            // Light red for dark theme
    warning: '#ff9800',          // Orange warning for contrast
    success: '#81c784',          // Light green success
    disabled: '#5a7a5a',         // Muted green for disabled in dark theme
    icon: '#66bb6a',             // Light green icons
    white: '#ffffff',            // White
    overlay: 'rgba(0, 0, 0, 0.85)', // Dark overlay
  }
})