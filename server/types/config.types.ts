export interface State {
  code: string
  name: string
}

export interface Country {
  code: string
  name: string
}

export interface IdentificationType {
  value: string
  label: string
  requiresState: boolean
}

export interface Product {
  type: string
  title: string
  description: string
  icon: string
}

export interface Document {
  id: string
  name: string
  description?: string
  url: string
  required: boolean
  category: string
}

export interface DocumentRule {
  productTypes?: string[]
  hasSSN?: boolean
  noSSN?: boolean
  documentIds: string[]
}

export interface DocumentConfig {
  showAcceptAllButton: boolean
  documents: Document[]
  rules: DocumentRule[]
}

export interface BankInfo {
  bankName: string
  displayName: string
  contact: {
    phone: string
    phoneDisplay: string
    email: string
    hours: string
  }
  branding: {
    primaryColor: string
    logoIcon: string
  }
}

export interface BadSSNConfig {
  badSSNs: string[]
  description: string
}

export interface ConfigCache {
  states?: State[]
  countries?: Country[]
  identificationTypes?: IdentificationType[]
  products?: Product[]
  documents?: DocumentConfig
  bankInfo?: BankInfo
  badSSNs?: BadSSNConfig
}