import { useState, useEffect } from 'react'
import { Building2, User, Mail, Phone, MapPin } from 'lucide-react'
import { CustomerInfoSchema, type CustomerInfoData, type AddressData } from '../types/customer'
import { type ProductType } from '../types/products'
import { configService, type State, type BankInfo } from '../services/configService'
import { useOnboarding } from '../context/OnboardingContext'
import { StepIndicator } from './StepIndicator'
import { StateSelect } from './StateSelect'
import { useTheme } from '../context/ThemeContext'

interface CustomerInfoProps {
  selectedProducts: ProductType[]
  onNext: (customerInfo: CustomerInfoData) => void
}

export default function CustomerInfo({ selectedProducts, onNext }: CustomerInfoProps) {
  const { currentStep } = useOnboarding()
  const { styles } = useTheme()
  const [formData, setFormData] = useState<CustomerInfoData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    mailingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    billingAddress: undefined,
    useSameAddress: true,
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [states, setStates] = useState<State[]>([])
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [statesData, bankInfoData] = await Promise.all([
          configService.getStates(),
          configService.getBankInfo()
        ])
        setStates(statesData)
        setBankInfo(bankInfoData)
      } catch (error) {
        console.error('Failed to load configuration:', error)
      }
    }
    loadConfigs()
  }, [])

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Apply formatting based on length
    if (cleaned.length <= 3) {
      return cleaned
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    } else if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    } else {
      // Limit to 10 digits
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`
    }
  }

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value
    
    if (field === 'phoneNumber') {
      processedValue = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue,
    }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddressChange = (type: 'mailingAddress' | 'billingAddress', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      } as AddressData,
    }))
    
    const fieldKey = `${type}.${field}`
    if (errors[fieldKey]) {
      setErrors(prev => ({ ...prev, [fieldKey]: '' }))
    }
  }

  const handleToggleAddress = () => {
    setFormData(prev => ({
      ...prev,
      useSameAddress: !prev.useSameAddress,
      billingAddress: !prev.useSameAddress ? undefined : {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const validatedData = CustomerInfoSchema.parse(formData)
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
        <h1 className={styles.bankName}>{bankInfo?.bankName || 'Cool Bank'}</h1>
      </div>
      
      <StepIndicator currentStep={currentStep} totalSteps={5} />
      
      <h1 className={styles.heading}>Personal Information</h1>
      <p className={styles.subheading}>
        Please provide your contact information and addresses for your new account(s).
      </p>

      <div className={styles.selectedProductsContainer}>
        <div className={styles.selectedProductsContent}>
          <h3 className={styles.selectedProductsTitle}>Selected Products:</h3>
          {selectedProducts.map(product => (
            <span key={product} className={styles.productTag}>
              {product.replace('-', ' ')}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContainer}>
        <div className={styles.sectionTitle}>
          <User className={styles.sectionIcon} />
          Personal Details
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              className={styles.input}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              autoComplete="given-name"
            />
            {errors.firstName && <span className={styles.errorText}>{errors.firstName}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              className={styles.input}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              autoComplete="family-name"
            />
            {errors.lastName && <span className={styles.errorText}>{errors.lastName}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="email">
              <Mail className={styles.labelIcon} />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              autoComplete="email"
            />
            {errors.email && <span className={styles.errorText}>{errors.email}</span>}
          </div>

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="phoneNumber">
              <Phone className={styles.labelIcon} />
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className={styles.input}
              placeholder="(555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              autoComplete="tel"
            />
            {errors.phoneNumber && <span className={styles.errorText}>{errors.phoneNumber}</span>}
          </div>
        </div>

        <div className={styles.sectionTitle}>
          <MapPin className={styles.sectionIcon} />
          Mailing Address
        </div>

        <div className={styles.formField}>
          <label className={styles.label} htmlFor="mailingStreet">Street Address</label>
          <input
            id="mailingStreet"
            type="text"
            className={styles.input}
            value={formData.mailingAddress.street}
            onChange={(e) => handleAddressChange('mailingAddress', 'street', e.target.value)}
            autoComplete="street-address"
          />
          {errors['mailingAddress.street'] && <span className={styles.errorText}>{errors['mailingAddress.street']}</span>}
        </div>

        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label} htmlFor="mailingCity">City</label>
            <input
              id="mailingCity"
              type="text"
              className={styles.input}
              value={formData.mailingAddress.city}
              onChange={(e) => handleAddressChange('mailingAddress', 'city', e.target.value)}
              autoComplete="address-level2"
            />
            {errors['mailingAddress.city'] && <span className={styles.errorText}>{errors['mailingAddress.city']}</span>}
          </div>

          <StateSelect
            id="mailingState"
            label="State"
            value={formData.mailingAddress.state}
            onChange={(value) => handleAddressChange('mailingAddress', 'state', value)}
            states={states}
            error={errors['mailingAddress.state']}
            autoComplete="address-level1"
          />

          <div className={styles.formField}>
            <label className={styles.label} htmlFor="mailingZip">ZIP Code</label>
            <input
              id="mailingZip"
              type="text"
              className={styles.input}
              placeholder="12345"
              value={formData.mailingAddress.zipCode}
              onChange={(e) => handleAddressChange('mailingAddress', 'zipCode', e.target.value)}
              autoComplete="postal-code"
            />
            {errors['mailingAddress.zipCode'] && <span className={styles.errorText}>{errors['mailingAddress.zipCode']}</span>}
          </div>
        </div>

        <div className={styles.toggle}>
          <div 
            className={styles.toggleSwitch}
            data-enabled={formData.useSameAddress}
            onClick={handleToggleAddress}
          >
            <div className={styles.toggleHandle} />
          </div>
          <label style={{ cursor: 'pointer' }} onClick={handleToggleAddress}>
            Use same address for billing
          </label>
        </div>

        {!formData.useSameAddress && (
          <>
            <div className={styles.sectionTitle}>
              <MapPin style={{ display: 'inline', marginRight: '0.5rem', width: '1.25rem', height: '1.25rem' }} />
              Billing Address
            </div>

            <div className={styles.formField}>
              <label className={styles.label} htmlFor="billingStreet">Street Address</label>
              <input
                id="billingStreet"
                type="text"
                className={styles.input}
                value={formData.billingAddress?.street || ''}
                onChange={(e) => handleAddressChange('billingAddress', 'street', e.target.value)}
                autoComplete="billing street-address"
              />
              {errors['billingAddress.street'] && <span className={styles.errorText}>{errors['billingAddress.street']}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.label} htmlFor="billingCity">City</label>
                <input
                  id="billingCity"
                  type="text"
                  className={styles.input}
                  value={formData.billingAddress?.city || ''}
                  onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                  autoComplete="billing address-level2"
                />
                {errors['billingAddress.city'] && <span className={styles.errorText}>{errors['billingAddress.city']}</span>}
              </div>

              <StateSelect
                id="billingState"
                label="State"
                value={formData.billingAddress?.state || ''}
                onChange={(value) => handleAddressChange('billingAddress', 'state', value)}
                states={states}
                error={errors['billingAddress.state']}
                autoComplete="billing address-level1"
              />

              <div className={styles.formField}>
                <label className={styles.label} htmlFor="billingZip">ZIP Code</label>
                <input
                  id="billingZip"
                  type="text"
                  className={styles.input}
                  placeholder="12345"
                  value={formData.billingAddress?.zipCode || ''}
                  onChange={(e) => handleAddressChange('billingAddress', 'zipCode', e.target.value)}
                  autoComplete="billing postal-code"
                />
                {errors['billingAddress.zipCode'] && <span className={styles.errorText}>{errors['billingAddress.zipCode']}</span>}
              </div>
            </div>
          </>
        )}

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.primaryButton}>
            Next
          </button>
        </div>
      </form>
    </div>
  )
}