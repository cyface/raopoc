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
  category: 'terms' | 'privacy' | 'disclosure' | 'agreement' | 'notice'
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

class ConfigService {
  private statesCache: State[] | null = null
  private countriesCache: Country[] | null = null
  private identificationTypesCache: IdentificationType[] | null = null
  private productsCache: Product[] | null = null
  private documentsCache: DocumentConfig | null = null
  private bankInfoCache: BankInfo | null = null
  private lastStatesLoad = 0
  private lastCountriesLoad = 0
  private lastIdentificationTypesLoad = 0
  private lastProductsLoad = 0
  private lastDocumentsLoad = 0
  private lastBankInfoLoad = 0
  private readonly cacheTimeout: number
  private readonly apiBaseUrl: string

  constructor() {
    // Get API base URL from environment variable, default to local development server
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
    
    // Get cache timeout from environment variable, default to 5000ms (5 seconds)
    const envCacheTimeout = import.meta.env.VITE_CONFIG_CACHE_TIMEOUT
    this.cacheTimeout = this.parseAndValidateCacheTimeout(envCacheTimeout)
  }

  private parseAndValidateCacheTimeout(value: string | undefined): number {
    // Default to 5 seconds (5000ms)
    const defaultTimeout = 5000
    
    if (!value) {
      return defaultTimeout
    }
    
    const parsed = parseInt(value, 10)
    
    // Validate the parsed value
    if (isNaN(parsed) || parsed < 0) {
      console.warn(`Invalid VITE_CONFIG_CACHE_TIMEOUT value: "${value}". Using default: ${defaultTimeout}ms`)
      return defaultTimeout
    }
    
    // Set reasonable bounds: minimum 0ms (no cache), maximum 1 hour (3600000ms)
    const maxTimeout = 3600000 // 1 hour
    if (parsed > maxTimeout) {
      console.warn(`VITE_CONFIG_CACHE_TIMEOUT too large: ${parsed}ms. Using maximum: ${maxTimeout}ms`)
      return maxTimeout
    }
    
    return parsed
  }

  private shouldReloadStates(): boolean {
    return this.statesCache === null || (Date.now() - this.lastStatesLoad) > this.cacheTimeout
  }

  private shouldReloadCountries(): boolean {
    return this.countriesCache === null || (Date.now() - this.lastCountriesLoad) > this.cacheTimeout
  }

  private shouldReloadIdentificationTypes(): boolean {
    return this.identificationTypesCache === null || (Date.now() - this.lastIdentificationTypesLoad) > this.cacheTimeout
  }

  private shouldReloadProducts(): boolean {
    return this.productsCache === null || (Date.now() - this.lastProductsLoad) > this.cacheTimeout
  }

  private shouldReloadDocuments(): boolean {
    return this.documentsCache === null || (Date.now() - this.lastDocumentsLoad) > this.cacheTimeout
  }

  private shouldReloadBankInfo(): boolean {
    return this.bankInfoCache === null || (Date.now() - this.lastBankInfoLoad) > this.cacheTimeout
  }

  async getStates(): Promise<State[]> {
    if (this.shouldReloadStates()) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/config/states`)
        if (!response.ok) {
          throw new Error(`Failed to fetch states: ${response.status}`)
        }
        const data = await response.json()
        this.statesCache = data as State[]
        this.lastStatesLoad = Date.now()
      } catch (error) {
        console.error('Failed to load states configuration:', error)
        // Return cached data if available, otherwise empty array
        return this.statesCache || []
      }
    }
    return this.statesCache || []
  }

  async getCountries(): Promise<Country[]> {
    if (this.shouldReloadCountries()) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/config/countries`)
        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.status}`)
        }
        const data = await response.json()
        this.countriesCache = data as Country[]
        this.lastCountriesLoad = Date.now()
      } catch (error) {
        console.error('Failed to load countries configuration:', error)
        // Return cached data if available, otherwise empty array
        return this.countriesCache || []
      }
    }
    return this.countriesCache || []
  }

  async getIdentificationTypes(): Promise<IdentificationType[]> {
    if (this.shouldReloadIdentificationTypes()) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/config/identification-types`)
        if (!response.ok) {
          throw new Error(`Failed to fetch identification types: ${response.status}`)
        }
        const data = await response.json()
        this.identificationTypesCache = data as IdentificationType[]
        this.lastIdentificationTypesLoad = Date.now()
      } catch (error) {
        console.error('Failed to load identification types configuration:', error)
        // Return cached data if available, otherwise empty array
        return this.identificationTypesCache || []
      }
    }
    return this.identificationTypesCache || []
  }

  async getProducts(): Promise<Product[]> {
    if (this.shouldReloadProducts()) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/config/products`)
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`)
        }
        const data = await response.json()
        this.productsCache = data as Product[]
        this.lastProductsLoad = Date.now()
      } catch (error) {
        console.error('Failed to load products configuration:', error)
        // Return cached data if available, otherwise empty array
        return this.productsCache || []
      }
    }
    return this.productsCache || []
  }

  async getDocuments(): Promise<DocumentConfig> {
    if (this.shouldReloadDocuments()) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/config/documents`)
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.status}`)
        }
        const data = await response.json()
        this.documentsCache = data as DocumentConfig
        this.lastDocumentsLoad = Date.now()
      } catch (error) {
        console.error('Failed to load documents configuration:', error)
        // Return cached data if available, otherwise empty config
        return this.documentsCache || { showAcceptAllButton: true, documents: [], rules: [] }
      }
    }
    return this.documentsCache || { showAcceptAllButton: true, documents: [], rules: [] }
  }

  async getBankInfo(): Promise<BankInfo> {
    if (this.shouldReloadBankInfo()) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/config/bank-info`)
        if (!response.ok) {
          throw new Error(`Failed to fetch bank info: ${response.status}`)
        }
        const data = await response.json()
        this.bankInfoCache = data as BankInfo
        this.lastBankInfoLoad = Date.now()
      } catch (error) {
        console.error('Failed to load bank info configuration:', error)
        // Return cached data if available, otherwise default bank info
        return this.bankInfoCache || {
          bankName: "Cool Bank",
          displayName: "Cool Bank",
          contact: {
            phone: "1-800-COOLBNK",
            phoneDisplay: "1-800-COOLBNK (1-800-XXX-XXXX)",
            email: "support@coolbank.com",
            hours: "Monday - Friday 8:00 AM - 8:00 PM EST"
          },
          branding: {
            primaryColor: "#3b82f6",
            logoIcon: "Building2"
          }
        }
      }
    }
    return this.bankInfoCache || {
      bankName: "Cool Bank",
      displayName: "Cool Bank",
      contact: {
        phone: "1-800-COOLBNK",
        phoneDisplay: "1-800-COOLBNK (1-800-XXX-XXXX)",
        email: "support@coolbank.com",
        hours: "Monday - Friday 8:00 AM - 8:00 PM EST"
      },
      branding: {
        primaryColor: "#3b82f6",
        logoIcon: "Building2"
      }
    }
  }

  clearCache(): void {
    this.statesCache = null
    this.countriesCache = null
    this.identificationTypesCache = null
    this.productsCache = null
    this.documentsCache = null
    this.bankInfoCache = null
    this.lastStatesLoad = 0
    this.lastCountriesLoad = 0
    this.lastIdentificationTypesLoad = 0
    this.lastProductsLoad = 0
    this.lastDocumentsLoad = 0
    this.lastBankInfoLoad = 0
  }

  // Helper method to get identification types that require state
  async getIdentificationTypesThatRequireState(): Promise<string[]> {
    const types = await this.getIdentificationTypes()
    return types.filter(type => type.requiresState).map(type => type.value)
  }
}

// Export singleton instance
export const configService = new ConfigService()