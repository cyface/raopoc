import { style } from '@vanilla-extract/css'

// Re-export all base theme styles
export * from './theme.css'

// Green Banking Theme - Light variant
export const greenLightTheme = style({
  vars: {
    '--green-primary': '#1b5e20',
    '--green-secondary': '#2e7d32', 
    '--green-accent': '#4caf50',
    '--green-surface': '#f8fdf8',
    '--green-border': '#c8e6c9',
    '--green-text': '#1b5e20',
  }
})

// Green Banking Theme - Dark variant  
export const greenDarkTheme = style({
  vars: {
    '--green-primary': '#66bb6a',
    '--green-secondary': '#4caf50',
    '--green-accent': '#81c784', 
    '--green-surface': '#0a1a0a',
    '--green-border': '#2e5d2e',
    '--green-text': '#e8f5e8',
  }
})