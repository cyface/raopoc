import { useState } from 'react'
import { Building2, Shield, CreditCard } from 'lucide-react'
import { IdentificationInfoSchema, type IdentificationInfoData, IDENTIFICATION_TYPES } from '../types/identification'
import * as styles from '../styles/theme.css'

// Import US states from CustomerInfo component
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

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
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

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
      
      // Remove state if not driver's license or state-id
      if (cleanedData.identificationType !== 'drivers-license' && cleanedData.identificationType !== 'state-id') {
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
        <h1 className={styles.bankName}>Premier Bank</h1>
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
            {IDENTIFICATION_TYPES.map(type => (
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

          {(formData.identificationType === 'drivers-license' || formData.identificationType === 'state-id') && (
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
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
              {errors.state && <span className={styles.errorText}>{errors.state}</span>}
            </div>
          )}
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
            I don't have a Social Security Number
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