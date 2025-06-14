import { useState, useEffect } from 'react'
import { Building2, Shield, CreditCard } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IdentificationInfoSchema, type IdentificationInfoData } from '../types/identification'
import { configService, type State, type Country, type IdentificationType, type BankInfo } from '../services/configService'
import { useOnboarding } from '../context/OnboardingContext'
import { StepIndicator } from './StepIndicator'
import { StateSelect } from './StateSelect'
import { CountrySelect } from './CountrySelect'
import { useTheme } from '../context/ThemeContext'

interface IdentificationInfoProps {
  onNext: (identificationInfo: IdentificationInfoData) => void
}

export default function IdentificationInfo({ onNext }: IdentificationInfoProps) {
  const { currentStep, performCreditCheck } = useOnboarding()
  const { styles } = useTheme()
  const { t } = useTranslation()
  const [formData, setFormData] = useState<IdentificationInfoData>({
    identificationType: 'drivers-license',
    identificationNumber: '',
    state: '',
    country: '',
    socialSecurityNumber: '',
    noSSN: false,
    dateOfBirth: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [states, setStates] = useState<State[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [identificationTypes, setIdentificationTypes] = useState<IdentificationType[]>([])
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [statesData, countriesData, identificationTypesData, bankInfoData] = await Promise.all([
          configService.getStates(),
          configService.getCountries(),
          configService.getIdentificationTypes(),
          configService.getBankInfo()
        ])
        setStates(statesData)
        setCountries(countriesData)
        setIdentificationTypes(identificationTypesData)
        setBankInfo(bankInfoData)
      } catch (error) {
        console.error('Failed to load configuration:', error)
      }
    }
    loadConfigs()
  }, [])

  const formatSSN = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Apply SSN formatting
    if (cleaned.length <= 3) {
      return cleaned
    } else if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
    } else if (cleaned.length <= 9) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`
    } else {
      // Limit to 9 digits
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`
    }
  }

  const handleInputChange = (field: keyof IdentificationInfoData, value: string | boolean) => {
    let processedValue = value
    
    if (field === 'socialSecurityNumber' && typeof value === 'string') {
      processedValue = formatSSN(value)
    }
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: processedValue,
      }
      
      // Clear SSN when noSSN is toggled on
      if (field === 'noSSN' && value === true) {
        newData.socialSecurityNumber = ''
      }
      
      return newData
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Clean up the form data before validation
      const cleanedData = { ...formData }
      
      // Remove state if identification type doesn't require state
      const currentType = identificationTypes.find(type => type.value === cleanedData.identificationType)
      if (!currentType?.requiresState) {
        delete cleanedData.state
      }
      
      // Clear SSN if noSSN is checked
      if (cleanedData.noSSN) {
        cleanedData.socialSecurityNumber = ''
      }
      
      const validatedData = IdentificationInfoSchema.parse(cleanedData)
      
      // Perform credit check if SSN is provided
      if (validatedData.socialSecurityNumber && !validatedData.noSSN) {
        try {
          await performCreditCheck(validatedData.socialSecurityNumber)
        } catch (error) {
          console.error('Credit check failed:', error)
          // Continue with the flow even if credit check fails
          // The error will be handled in the credit check context
        }
      }
      
      onNext(validatedData)
    } catch (error) {
      const fieldErrors: Record<string, string> = {}
      
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> }
        zodError.errors?.forEach((err) => {
          const path = err.path.join('.')
          fieldErrors[path] = err.message
        })
      }
      
      setErrors(fieldErrors)
    }
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${styles.headerHiddenOnMobile}`}>
        <Building2 className={styles.bankIcon} />
        <h1 className={styles.bankName}>{bankInfo?.bankName || t('bankInfo.defaultName')}</h1>
      </div>
      
      <StepIndicator currentStep={currentStep} totalSteps={5} />
      
      <h1 className={styles.heading}>{t('identificationInfo.title')}</h1>
      <p className={styles.subheading}>
        {t('identificationInfo.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.sectionTitle}>
          <Shield className={styles.sectionIcon} />
          {t('identificationInfo.identificationDocument')}
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="identificationType">{t('identificationInfo.identificationType')}</label>
          <select
            id="identificationType"
            className={styles.select}
            value={formData.identificationType}
            onChange={(e) => handleInputChange('identificationType', e.target.value)}
            autoComplete="off"
          >
            {identificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.identificationType && <span className={styles.errorText}>{errors.identificationType}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="identificationNumber">
              {formData.identificationType === 'passport' ? t('identificationInfo.passportNumber') :
               formData.identificationType === 'drivers-license' ? t('identificationInfo.driversLicenseNumber') :
               formData.identificationType === 'state-id' ? t('identificationInfo.stateIdNumber') :
               t('identificationInfo.militaryIdNumber')}
            </label>
            <input
              id="identificationNumber"
              type="text"
              className={styles.input}
              value={formData.identificationNumber}
              onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
              autoComplete="off"
            />
            {errors.identificationNumber && <span className={styles.errorText}>{errors.identificationNumber}</span>}
          </div>

          {identificationTypes.find(type => type.value === formData.identificationType)?.requiresState && (
            <StateSelect
              id="state"
              label={t('identificationInfo.issuingState')}
              value={formData.state || ''}
              onChange={(value) => handleInputChange('state', value)}
              states={states}
              error={errors.state}
              autoComplete="address-level1"
            />
          )}

          {formData.identificationType === 'passport' && (
            <CountrySelect
              id="country"
              label={t('identificationInfo.issuingCountry')}
              value={formData.country || ''}
              onChange={(value) => handleInputChange('country', value)}
              countries={countries}
              error={errors.country}
              autoComplete="country"
            />
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="dateOfBirth">{t('identificationInfo.dateOfBirth')}</label>
          <input
            id="dateOfBirth"
            type="date"
            className={styles.input}
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            autoComplete="bday"
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.dateOfBirth && <span className={styles.errorText}>{errors.dateOfBirth}</span>}
        </div>

        <div className={styles.sectionTitle}>
          <CreditCard className={styles.sectionIcon} />
          {t('identificationInfo.socialSecurityInformation')}
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="socialSecurityNumber">{t('identificationInfo.socialSecurityNumber')}</label>
          <input
            id="socialSecurityNumber"
            type="text"
            className={styles.input}
            placeholder={formData.noSSN ? '' : '123-45-6789'}
            value={formData.socialSecurityNumber}
            onChange={(e) => handleInputChange('socialSecurityNumber', e.target.value)}
            maxLength={11}
            autoComplete="off"
            disabled={formData.noSSN}
            style={{
              backgroundColor: formData.noSSN ? styles.vars.color.surface : undefined,
              color: formData.noSSN ? styles.vars.color.disabled : undefined,
              cursor: formData.noSSN ? 'not-allowed' : undefined,
            }}
          />
          {errors.socialSecurityNumber && <span className={styles.errorText}>{errors.socialSecurityNumber}</span>}
        </div>

        <div className={styles.toggle}>
          <div 
            className={styles.toggleSwitch}
            data-enabled={formData.noSSN}
            onClick={() => handleInputChange('noSSN', !formData.noSSN)}
          >
            <div className={styles.toggleHandle} />
          </div>
          <label style={{ cursor: 'pointer' }} onClick={() => handleInputChange('noSSN', !formData.noSSN)}>
            {t('identificationInfo.noSSN')}
          </label>
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.primaryButton}>
            {t('common.next')}
          </button>
        </div>
      </form>
    </div>
  )
}