import { useState, useEffect } from 'react'
import { Building2, Shield, CreditCard } from 'lucide-react'
import { IdentificationInfoSchema, type IdentificationInfoData } from '../types/identification'
import { configService, type State, type IdentificationType, type BankInfo } from '../services/configService'
import * as styles from '../styles/theme.css'

interface IdentificationInfoProps {
  onNext: (identificationInfo: IdentificationInfoData) => void
}

export default function IdentificationInfo({ onNext }: IdentificationInfoProps) {
  const [formData, setFormData] = useState<IdentificationInfoData>({
    identificationType: 'passport',
    identificationNumber: '',
    state: '',
    socialSecurityNumber: '',
    noSSN: false,
    dateOfBirth: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [states, setStates] = useState<State[]>([])
  const [identificationTypes, setIdentificationTypes] = useState<IdentificationType[]>([])
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [statesData, identificationTypesData, bankInfoData] = await Promise.all([
          configService.getStates(),
          configService.getIdentificationTypes(),
          configService.getBankInfo()
        ])
        setStates(statesData)
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

  const handleSubmit = (e: React.FormEvent) => {
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
      onNext(validatedData)
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {}
      
      error.errors?.forEach((err: any) => {
        const path = err.path.join('.')
        fieldErrors[path] = err.message
      })
      
      setErrors(fieldErrors)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Building2 className={styles.bankIcon} />
        <h1 className={styles.bankName}>{bankInfo?.bankName || 'Cool Bank'}</h1>
      </div>
      
      <h1 className={styles.heading}>Identity Verification</h1>
      <p className={styles.subheading}>
        Please provide your identification details for account verification.
      </p>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.sectionTitle}>
          <Shield style={{ display: 'inline', marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} />
          Identification Document
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="identificationType">Identification Type</label>
          <select
            id="identificationType"
            className={styles.input}
            value={formData.identificationType}
            onChange={(e) => handleInputChange('identificationType', e.target.value as any)}
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
              {formData.identificationType === 'passport' ? 'Passport Number' :
               formData.identificationType === 'drivers-license' ? 'Driver\'s License Number' :
               formData.identificationType === 'state-id' ? 'State ID Number' :
               'Military ID Number'}
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
            <div className={styles.formField}>
              <label className={styles.label} htmlFor="state">
                {formData.identificationType === 'drivers-license' ? 'Issuing State' : 'Issuing State'}
              </label>
              <select
                id="state"
                className={styles.input}
                value={formData.state || ''}
                onChange={(e) => handleInputChange('state', e.target.value)}
                autoComplete="address-level1"
              >
                <option value="">Select a state</option>
                {states.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
              {errors.state && <span className={styles.errorText}>{errors.state}</span>}
            </div>
          )}
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="dateOfBirth">Date of Birth</label>
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
          <CreditCard style={{ display: 'inline', marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} />
          Social Security Information
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="socialSecurityNumber">Social Security Number</label>
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
              backgroundColor: formData.noSSN ? '#f3f4f6' : undefined,
              color: formData.noSSN ? '#9ca3af' : undefined,
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
            I don&apos;t have a Social Security Number
          </label>
        </div>

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.primaryButton}>
            Next
          </button>
        </div>
      </form>
    </div>
  )
}