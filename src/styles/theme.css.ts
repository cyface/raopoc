import { style } from '@vanilla-extract/css'

export const container = style({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
})

export const heading = style({
  fontSize: '2rem',
  fontWeight: '600',
  marginBottom: '1.5rem',
  color: '#1f2937',
  textAlign: 'center',
})

export const subheading = style({
  fontSize: '1.125rem',
  color: '#6b7280',
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
  border: '2px solid #e5e7eb',
  borderRadius: '0.5rem',
  padding: '1.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  ':hover': {
    borderColor: '#3b82f6',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
})

export const productCardSelected = style({
  borderColor: '#3b82f6',
  backgroundColor: '#eff6ff',
})

export const productTitle = style({
  fontSize: '1.25rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
  color: '#1f2937',
})

export const productDescription = style({
  color: '#6b7280',
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
    backgroundColor: '#9ba0a6',
    cursor: 'not-allowed',
  },
}])

export const errorMessage = style({
  color: '#dc2626',
  fontSize: '0.875rem',
  marginBottom: '1rem',
  textAlign: 'center',
})

export const productIcon = style({
  width: '3rem',
  height: '3rem',
  marginBottom: '1rem',
  color: '#3b82f6',
})

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '2rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid #e5e7eb',
})

export const bankIcon = style({
  width: '2rem',
  height: '2rem',
  marginRight: '0.75rem',
  color: '#3b82f6',
})

export const bankName = style({
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#1f2937',
})