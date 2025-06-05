import { style } from '@vanilla-extract/css'

export const container = style({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  backgroundColor: '#0f172a',
  color: '#e2e8f0',
  minHeight: '100vh',
})

export const heading = style({
  fontSize: '2rem',
  fontWeight: '600',
  marginBottom: '1.5rem',
  color: '#f1f5f9',
  textAlign: 'center',
})

export const subheading = style({
  fontSize: '1.125rem',
  color: '#94a3b8',
  marginBottom: '2rem',
  textAlign: 'center',
})

export const productGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2rem',
})

export const productCard = style({
  border: '2px solid #334155',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: '#1e293b',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  ':hover': {
    borderColor: '#60a5fa',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(96, 165, 250, 0.2)',
  },
})

export const productCardSelected = style({
  borderColor: '#60a5fa',
  backgroundColor: '#1e3a8a',
})

export const productTitle = style({
  fontSize: '1.25rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
  color: '#f1f5f9',
})

export const productDescription = style({
  color: '#94a3b8',
  lineHeight: '1.5',
})

export const buttonContainer = style({
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
})

export const button = style({
  padding: '0.75rem 2rem',
  borderRadius: '0.375rem',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '1rem',
})

export const primaryButton = style([button, {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  ':hover': {
    backgroundColor: '#2563eb',
  },
  ':disabled': {
    backgroundColor: '#475569',
    cursor: 'not-allowed',
  },
}])

export const errorMessage = style({
  color: '#f87171',
  fontSize: '0.875rem',
  marginBottom: '1rem',
  textAlign: 'center',
})

export const productIcon = style({
  width: '3rem',
  height: '3rem',
  marginBottom: '1rem',
  color: '#60a5fa',
})

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '2rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid #334155',
})

export const bankIcon = style({
  width: '2rem',
  height: '2rem',
  marginRight: '0.75rem',
  color: '#60a5fa',
})

export const bankName = style({
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#f1f5f9',
})

export const formContainer = style({
  display: 'grid',
  gap: '1.5rem',
  marginBottom: '2rem',
})

export const formRow = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '1rem',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

export const formField = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
})

export const label = style({
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#e2e8f0',
})

export const input = style({
  padding: '0.75rem',
  border: '1px solid #475569',
  borderRadius: '0.375rem',
  fontSize: '1rem',
  backgroundColor: '#1e293b',
  color: '#e2e8f0',
  transition: 'border-color 0.2s',
  ':focus': {
    outline: 'none',
    borderColor: '#60a5fa',
    boxShadow: '0 0 0 3px rgba(96, 165, 250, 0.1)',
  },
  '::placeholder': {
    color: '#64748b',
  },
})

export const select = style({
  padding: '0.75rem',
  border: '1px solid #475569',
  borderRadius: '0.375rem',
  fontSize: '1rem',
  backgroundColor: '#1e293b',
  color: '#e2e8f0',
  transition: 'border-color 0.2s',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%2394a3b8\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
  paddingRight: '2.5rem',
  ':focus': {
    outline: 'none',
    borderColor: '#60a5fa',
    boxShadow: '0 0 0 3px rgba(96, 165, 250, 0.1)',
  },
})

export const errorText = style({
  color: '#f87171',
  fontSize: '0.875rem',
})

export const toggle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '0.5rem',
  marginBottom: '1rem',
})

export const toggleSwitch = style({
  position: 'relative',
  width: '3rem',
  height: '1.5rem',
  backgroundColor: '#475569',
  borderRadius: '0.75rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  selectors: {
    '&[data-enabled="true"]': {
      backgroundColor: '#3b82f6',
    },
  },
})

export const toggleHandle = style({
  position: 'absolute',
  top: '0.125rem',
  left: '0.125rem',
  width: '1.25rem',
  height: '1.25rem',
  backgroundColor: '#ffffff',
  borderRadius: '50%',
  transition: 'transform 0.2s',
  selectors: {
    '[data-enabled="true"] &': {
      transform: 'translateX(1.5rem)',
    },
  },
})

export const sectionTitle = style({
  fontSize: '1.25rem',
  fontWeight: '600',
  color: '#f1f5f9',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid #334155',
})

export const stepIndicator = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem 0 2rem',
  marginBottom: '1rem',
  borderBottom: '1px solid #334155',
})

export const stepItem = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
})

export const stepDot = style({
  width: '2rem',
  height: '2rem',
  borderRadius: '50%',
  border: '2px solid #475569',
  backgroundColor: '#1e293b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#94a3b8',
  transition: 'all 0.2s',
})

export const stepLabel = style({
  fontSize: '0.75rem',
  color: '#94a3b8',
  textAlign: 'center',
  maxWidth: '100px',
})

export const activeStep = style({
  borderColor: '#60a5fa',
  backgroundColor: '#60a5fa',
  color: '#ffffff',
})

export const completedStep = style({
  borderColor: '#10b981',
  backgroundColor: '#10b981',
  color: '#ffffff',
})

export const stepConnector = style({
  width: '4rem',
  height: '2px',
  backgroundColor: '#475569',
  margin: '0 0.5rem',
  marginBottom: '1.5rem',
  transition: 'background-color 0.2s',
  selectors: {
    [`&.${completedStep}`]: {
      backgroundColor: '#10b981',
    },
  },
})

export const headerHiddenOnMobile = style({
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
  },
})

export const labelIcon = style({
  display: 'inline',
  marginRight: '0.25rem',
  width: '1rem',
  height: '1rem',
  verticalAlign: 'middle',
  marginTop: '-2px',
})

export const sectionIcon = style({
  display: 'inline',
  marginRight: '0.5rem',
  width: '1.25rem',
  height: '1.25rem',
  verticalAlign: 'middle',
  marginTop: '-2px',
})

export const themeToggle = style({
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 1rem',
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: '#334155',
  },
})

export const themeToggleLabel = style({
  fontSize: '0.875rem',
  color: '#94a3b8',
  fontWeight: '500',
})