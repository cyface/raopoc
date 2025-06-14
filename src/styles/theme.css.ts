import { createTheme, style } from '@vanilla-extract/css'

// Define the theme contract (shape of our theme)
export const [themeClass, vars] = createTheme({
  color: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#6b7280',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceHover: '#f9fafb',
    border: '#e5e7eb',
    borderLight: '#d1d5db',
    borderHover: '#3b82f6',
    borderFocus: '#3b82f6',
    selectedBg: '#eff6ff',
    error: '#dc2626',
    warning: '#f59e0b',
    success: '#10b981',
    disabled: '#9ba0a6',
    icon: '#3b82f6',
    white: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.75)',
  }
})

// Base styles that use the theme variables
export const container = style({
  maxWidth: '800px',
  margin: '0 auto',
  padding: '1rem 2rem 2rem',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  '@media': {
    '(max-width: 768px)': {
      padding: '0.75rem 1rem 2rem',
    },
  },
})

export const heading = style({
  fontSize: '2rem',
  fontWeight: '600',
  marginBottom: '1.5rem',
  color: vars.color.textPrimary,
  textAlign: 'center',
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
  },
})

export const subheading = style({
  fontSize: '1.125rem',
  color: vars.color.textSecondary,
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
  border: `2px solid ${vars.color.border}`,
  borderRadius: '0.5rem',
  padding: '1.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  backgroundColor: vars.color.surface,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  ':hover': {
    borderColor: vars.color.borderHover,
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
})

export const productCardSelected = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.selectedBg,
})

export const productTitle = style({
  fontSize: '1.25rem',
  fontWeight: '600',
  marginBottom: '0.5rem',
  color: vars.color.textPrimary,
})

export const productDescription = style({
  color: vars.color.textSecondary,
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
  backgroundColor: vars.color.primary,
  color: vars.color.white,
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
  ':disabled': {
    backgroundColor: vars.color.disabled,
    cursor: 'not-allowed',
  },
}])

export const errorMessage = style({
  color: vars.color.error,
  fontSize: '0.875rem',
  marginBottom: '1rem',
  textAlign: 'center',
})

export const productIcon = style({
  width: '3rem',
  height: '3rem',
  marginBottom: '1rem',
  color: vars.color.icon,
})

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.25rem',
  paddingBottom: '0.75rem',
  borderBottom: `1px solid ${vars.color.border}`,
})

export const bankIcon = style({
  width: '2rem',
  height: '2rem',
  marginRight: '0.75rem',
  color: vars.color.primary,
})

export const bankName = style({
  fontSize: '1.5rem',
  fontWeight: '700',
  color: vars.color.primary,
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
  color: vars.color.textSecondary,
})

export const input = style({
  padding: '0.75rem',
  border: `1px solid ${vars.color.borderLight}`,
  borderRadius: '0.375rem',
  fontSize: '1rem',
  backgroundColor: vars.color.surface,
  color: vars.color.textPrimary,
  transition: 'border-color 0.2s',
  ':focus': {
    outline: 'none',
    borderColor: vars.color.borderFocus,
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
})

export const select = style({
  padding: '0.75rem',
  border: `1px solid ${vars.color.borderLight}`,
  borderRadius: '0.375rem',
  fontSize: '1rem',
  backgroundColor: vars.color.surface,
  color: vars.color.textPrimary,
  transition: 'border-color 0.2s',
  appearance: 'none',
  backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23757575\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
  backgroundPosition: 'right 0.5rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.5em 1.5em',
  paddingRight: '2.5rem',
  ':focus': {
    outline: 'none',
    borderColor: vars.color.borderFocus,
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
})

export const errorText = style({
  color: vars.color.error,
  fontSize: '0.875rem',
})

export const toggle = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.borderLight}`,
  borderRadius: '0.5rem',
  marginBottom: '1rem',
})

export const toggleSwitch = style({
  position: 'relative',
  width: '3rem',
  height: '1.5rem',
  backgroundColor: vars.color.borderLight,
  borderRadius: '0.75rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  selectors: {
    '&[data-enabled="true"]': {
      backgroundColor: vars.color.primary,
    },
  },
})

export const toggleHandle = style({
  position: 'absolute',
  top: '0.125rem',
  left: '0.125rem',
  width: '1.25rem',
  height: '1.25rem',
  backgroundColor: vars.color.white,
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
  color: vars.color.textPrimary,
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: `1px solid ${vars.color.border}`,
})

export const stepIndicator = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75rem 0 1.25rem',
  marginBottom: '0.75rem',
  borderBottom: `1px solid ${vars.color.border}`,
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
  border: `2px solid ${vars.color.borderLight}`,
  backgroundColor: vars.color.surface,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: vars.color.textSecondary,
  transition: 'all 0.2s',
})

export const stepLabel = style({
  fontSize: '0.75rem',
  color: vars.color.textSecondary,
  textAlign: 'center',
  maxWidth: '100px',
})

export const activeStep = style({
  borderColor: vars.color.primary,
  backgroundColor: vars.color.primary,
  color: vars.color.white,
})

export const completedStep = style({
  borderColor: vars.color.success,
  backgroundColor: vars.color.success,
  color: vars.color.white,
})

export const stepConnector = style({
  width: '4rem',
  height: '2px',
  backgroundColor: vars.color.borderLight,
  margin: '0 0.5rem',
  marginBottom: '1rem',
  transition: 'background-color 0.2s',
  selectors: {
    [`&.${completedStep}`]: {
      backgroundColor: vars.color.success,
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
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '0.5rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
  },
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
  },
})

export const themeToggleLabel = style({
  fontSize: '0.875rem',
  color: vars.color.textSecondary,
  fontWeight: '500',
})

export const themeToggleIcon = style({
  color: vars.color.textSecondary,
})

// Selected products section styles
export const selectedProductsContainer = style({
  marginBottom: '1.5rem',
  padding: '1rem',
  backgroundColor: vars.color.selectedBg,
  borderRadius: '0.5rem',
  border: `1px solid ${vars.color.border}`,
})

export const selectedProductsContent = style({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  flexWrap: 'wrap',
})

export const selectedProductsTitle = style({
  margin: '0',
  color: vars.color.primary,
  fontWeight: '600',
})

export const productTag = style({
  padding: '0.25rem 0.75rem',
  backgroundColor: vars.color.primary,
  color: vars.color.white,
  borderRadius: '1rem',
  fontSize: '0.875rem',
  textTransform: 'capitalize',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
})

export const languageSwitcher = style({
  position: 'absolute',
  top: '1rem',
  left: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem',
  backgroundColor: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
  },
  '@media': {
    '(max-width: 768px)': {
      display: 'none',
    },
  },
})

export const languageIcon = style({
  width: '1rem',
  height: '1rem',
  color: vars.color.textSecondary,
})

export const languageLinks = style({
  display: 'flex',
  gap: '0.5rem',
})

export const languageLink = style({
  border: 'none',
  backgroundColor: 'transparent',
  fontSize: '0.875rem',
  color: vars.color.textSecondary,
  fontWeight: '500',
  cursor: 'pointer',
  outline: 'none',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  transition: 'all 0.2s',
  ':hover': {
    backgroundColor: vars.color.surfaceHover,
    color: vars.color.textPrimary,
  },
})

export const languageLinkActive = style({
  backgroundColor: vars.color.primary,
  color: vars.color.white,
  ':hover': {
    backgroundColor: vars.color.primaryHover,
  },
})

