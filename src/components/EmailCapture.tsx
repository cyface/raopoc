import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useOnboarding } from '../context/OnboardingContext'
import { useTheme } from '../context/ThemeContext'
import { useBankInfo } from '../hooks/useConfig'
import { ROUTES } from '../constants/routes'
import { z } from 'zod'

const EmailSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export default function EmailCapture() {
  const { setEmail } = useOnboarding()
  const { styles } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { bankInfo } = useBankInfo()
  
  const [email, setEmailInput] = useState('')
  const [error, setError] = useState<string>('')
  const [touched, setTouched] = useState(false)

  const validateEmail = (value: string) => {
    try {
      EmailSchema.parse({ email: value })
      setError('')
      return true
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Invalid email')
      }
      return false
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmailInput(value)
    if (touched && value) {
      validateEmail(value)
    }
  }

  const handleBlur = () => {
    setTouched(true)
    if (email) {
      validateEmail(email)
    }
  }

  const handleNext = () => {
    setTouched(true)
    if (validateEmail(email)) {
      setEmail(email)
      navigate(ROUTES.STEP_2)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Building2 className={styles.bankIcon} />
        <h1 className={styles.bankName}>{bankInfo?.bankName || t('bankInfo.defaultName')}</h1>
      </div>
      
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: styles.vars.color.primary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <Mail style={{ width: '32px', height: '32px', color: styles.vars.color.white }} />
          </div>
          
          <h1 className={styles.heading}>{t('emailCapture.title')}</h1>
          <p className={styles.subheading}>
            {t('emailCapture.subtitle')}
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="email" style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: styles.vars.color.textPrimary
          }}>
            {t('emailCapture.emailLabel')}
          </label>
          
          <div style={{ position: 'relative' }}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              onKeyPress={handleKeyPress}
              placeholder={t('emailCapture.emailPlaceholder')}
              className={styles.input}
              style={{
                paddingLeft: '2.5rem',
                borderColor: touched && error ? styles.vars.color.error : undefined
              }}
              autoFocus
            />
            <Mail style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: styles.vars.color.icon
            }} />
          </div>
          
          {touched && error && (
            <p style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.875rem', 
              color: styles.vars.color.error 
            }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ 
          backgroundColor: styles.vars.color.surface,
          border: `1px solid ${styles.vars.color.border}`,
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          fontSize: '0.875rem',
          color: styles.vars.color.textSecondary
        }}>
          <p style={{ margin: 0 }}>
            {t('emailCapture.privacyNotice')}
          </p>
        </div>

        <div className={styles.buttonContainer}>
          <button
            className={styles.primaryButton}
            onClick={handleNext}
            disabled={!email || (touched && !!error)}
          >
            {t('common.continue')}
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: styles.vars.color.textSecondary
        }}>
          {t('emailCapture.skipNotice')}
        </p>
      </div>
    </div>
  )
}