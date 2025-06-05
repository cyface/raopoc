import { style } from '@vanilla-extract/css'

// Re-export all base theme styles
export * from './theme.css'

// Dark Theme - color overrides only
export const darkTheme = style({
  vars: {
    '--dark-background': '#0f172a',
    '--dark-surface': '#1e293b',
    '--dark-card': '#1e293b',
    '--dark-border': '#334155',
    '--dark-border-hover': '#475569',
    '--dark-text-primary': '#f1f5f9',
    '--dark-text-secondary': '#94a3b8',
    '--dark-text-muted': '#64748b',
    '--dark-primary': '#3b82f6',
    '--dark-primary-hover': '#60a5fa',
    '--dark-accent': '#60a5fa',
  }
})

// Override container to apply dark background and text colors
export const container = style([
  darkTheme,
  {
    maxWidth: '800px',
    margin: '0 auto', 
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: 'var(--dark-background)',
    color: 'var(--dark-text-primary)',
    minHeight: '100vh',
  }
])

// Override specific components that need dark styling
export const heading = style({
  fontSize: '2rem',
  fontWeight: '600',
  marginBottom: '1.5rem',
  color: 'var(--dark-text-primary)',
  textAlign: 'center',
})

export const subheading = style({
  fontSize: '1.125rem',
  color: 'var(--dark-text-secondary)',
  marginBottom: '2rem',
  textAlign: 'center',
})

export const productCard = style({
  border: '2px solid var(--dark-border)',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: 'var(--dark-card)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  ':hover': {
    borderColor: 'var(--dark-accent)',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(96, 165, 250, 0.2)',
  },
})

export const productCardSelected = style({
  borderColor: 'var(--dark-primary)',
  backgroundColor: 'var(--dark-border)',
})

export const primaryButton = style({
  padding: '0.75rem 2rem',
  borderRadius: '0.375rem',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '1rem',
  backgroundColor: 'var(--dark-primary)',
  color: '#ffffff',
  ':hover': {
    backgroundColor: 'var(--dark-primary-hover)',
  },
  ':disabled': {
    backgroundColor: '#64748b',
    cursor: 'not-allowed',
  },
})

export const input = style({
  padding: '0.75rem',
  border: '1px solid var(--dark-border)',
  borderRadius: '0.375rem',
  fontSize: '1rem',
  backgroundColor: 'var(--dark-surface)',
  color: 'var(--dark-text-primary)',
  transition: 'border-color 0.2s',
  ':focus': {
    outline: 'none',
    borderColor: 'var(--dark-primary)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
})

export const select = style({
  padding: '0.75rem',
  border: '1px solid var(--dark-border)',
  borderRadius: '0.375rem',
  fontSize: '1rem',
  backgroundColor: 'var(--dark-surface)',
  color: 'var(--dark-text-primary)',
  transition: 'border-color 0.2s',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%2394a3b8\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
  paddingRight: '2.5rem',
  ':focus': {
    outline: 'none',
    borderColor: 'var(--dark-primary)',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
})