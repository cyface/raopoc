import type { ProductType } from '../types/products'
import type { CustomerInfoData } from '../types/customer'
import type { IdentificationInfoData, IdentificationType } from '../types/identification'
import type { DocumentAcceptanceState } from '../types/documents'

export interface MockDataConfig {
  identificationType?: IdentificationType
  noSSN?: boolean
  productTypes?: ProductType[]
  billingAddressDifferent?: boolean
}

export interface MockDataForStep {
  selectedProducts?: ProductType[]
  customerInfo?: CustomerInfoData
  identificationInfo?: IdentificationInfoData
  documentAcceptance?: DocumentAcceptanceState
}

const DEFAULT_PRODUCTS: ProductType[] = ['checking', 'savings']

const MOCK_CUSTOMER_INFO: CustomerInfoData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phoneNumber: '(555) 123-4567',
  mailingAddress: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210'
  },
  useSameAddress: true
}

const MOCK_CUSTOMER_INFO_DIFFERENT_BILLING: CustomerInfoData = {
  ...MOCK_CUSTOMER_INFO,
  useSameAddress: false,
  billingAddress: {
    street: '456 Business Ave',
    city: 'Commercial City',
    state: 'NY',
    zipCode: '10001'
  }
}

const MOCK_IDENTIFICATION_DRIVERS_LICENSE: IdentificationInfoData = {
  identificationType: 'drivers-license',
  identificationNumber: 'D1234567',
  state: 'CA',
  socialSecurityNumber: '123-45-6789',
  noSSN: false,
  dateOfBirth: '1990-05-15'
}

const MOCK_IDENTIFICATION_PASSPORT: IdentificationInfoData = {
  identificationType: 'passport',
  identificationNumber: 'A12345678',
  country: 'United States',
  socialSecurityNumber: '123-45-6789',
  noSSN: false,
  dateOfBirth: '1990-05-15'
}

const MOCK_IDENTIFICATION_STATE_ID: IdentificationInfoData = {
  identificationType: 'state-id',
  identificationNumber: 'S9876543',
  state: 'TX',
  socialSecurityNumber: '123-45-6789',
  noSSN: false,
  dateOfBirth: '1990-05-15'
}

const MOCK_IDENTIFICATION_MILITARY_ID: IdentificationInfoData = {
  identificationType: 'military-id',
  identificationNumber: 'M555666777',
  socialSecurityNumber: '123-45-6789',
  noSSN: false,
  dateOfBirth: '1990-05-15'
}

const MOCK_IDENTIFICATION_NO_SSN: IdentificationInfoData = {
  identificationType: 'passport',
  identificationNumber: 'F87654321',
  country: 'Canada',
  noSSN: true,
  dateOfBirth: '1992-08-22'
}

const MOCK_DOCUMENT_ACCEPTANCE: DocumentAcceptanceState = {
  acceptances: {
    'terms-of-service': {
      documentId: 'terms-of-service',
      accepted: true,
      acceptedAt: new Date().toISOString()
    },
    'privacy-policy': {
      documentId: 'privacy-policy',
      accepted: true,
      acceptedAt: new Date().toISOString()
    },
    'account-agreement': {
      documentId: 'account-agreement',
      accepted: true,
      acceptedAt: new Date().toISOString()
    }
  },
  allAccepted: true
}

function getMockIdentificationInfo(config: MockDataConfig): IdentificationInfoData {
  if (config.noSSN) {
    return MOCK_IDENTIFICATION_NO_SSN
  }

  switch (config.identificationType) {
    case 'passport':
      return MOCK_IDENTIFICATION_PASSPORT
    case 'state-id':
      return MOCK_IDENTIFICATION_STATE_ID
    case 'military-id':
      return MOCK_IDENTIFICATION_MILITARY_ID
    case 'drivers-license':
    default:
      return MOCK_IDENTIFICATION_DRIVERS_LICENSE
  }
}

function getMockCustomerInfo(config: MockDataConfig): CustomerInfoData {
  return config.billingAddressDifferent 
    ? MOCK_CUSTOMER_INFO_DIFFERENT_BILLING 
    : MOCK_CUSTOMER_INFO
}

export function populateMockDataUpToStep(
  targetStep: number,
  config: MockDataConfig = {}
): MockDataForStep {
  const mockData: MockDataForStep = {}
  
  // Populate data for each step up to the target step
  if (targetStep >= 1) {
    // Step 1: Product Selection
    mockData.selectedProducts = config.productTypes || DEFAULT_PRODUCTS
  }
  
  if (targetStep >= 2) {
    // Step 2: Customer Info
    mockData.customerInfo = getMockCustomerInfo(config)
  }
  
  if (targetStep >= 3) {
    // Step 3: Identification Info
    mockData.identificationInfo = getMockIdentificationInfo(config)
  }
  
  if (targetStep >= 4) {
    // Step 4: Document Acceptance
    mockData.documentAcceptance = MOCK_DOCUMENT_ACCEPTANCE
  }
  
  // Step 5 (Confirmation) doesn't require additional data
  
  return mockData
}

export const MOCK_SCENARIOS = {
  driversLicense: {
    name: 'Driver\'s License',
    config: { identificationType: 'drivers-license' as const }
  },
  passport: {
    name: 'Passport',
    config: { identificationType: 'passport' as const }
  },
  stateId: {
    name: 'State ID',
    config: { identificationType: 'state-id' as const }
  },
  militaryId: {
    name: 'Military ID',
    config: { identificationType: 'military-id' as const }
  },
  noSSN: {
    name: 'No SSN (International)',
    config: { identificationType: 'passport' as const, noSSN: true }
  },
  differentBilling: {
    name: 'Different Billing Address',
    config: { identificationType: 'drivers-license' as const, billingAddressDifferent: true }
  },
  moneyMarket: {
    name: 'Money Market Account',
    config: { 
      identificationType: 'drivers-license' as const,
      productTypes: ['checking', 'money-market'] as ProductType[]
    }
  },
  savingsOnly: {
    name: 'Savings Only',
    config: { 
      identificationType: 'drivers-license' as const,
      productTypes: ['savings'] as ProductType[]
    }
  }
} as const

export type MockScenario = keyof typeof MOCK_SCENARIOS