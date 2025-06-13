import { createCacheKey } from '../hooks/useUrlParams'
import { getApiUrl } from '../utils/apiUrl'

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
  theme?: 'light' | 'dark' | 'greenLight' | 'greenDark' | 'orangeLight' | 'orangeDark'
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

interface CacheEntry<T> {
  data: T
  timestamp: number
}

/**
 * ConfigService with multi-dimensional caching
 * Caches configurations by (bank, language) combinations for instant switching
 */
class ConfigService {
  // Multi-dimensional cache maps keyed by "bank-language" (e.g., "warmbank-es", "default-en")
  private statesCache = new Map<string, CacheEntry<State[]>>()
  private countriesCache = new Map<string, CacheEntry<Country[]>>()
  private identificationTypesCache = new Map<string, CacheEntry<IdentificationType[]>>()
  private productsCache = new Map<string, CacheEntry<Product[]>>()
  private documentsCache = new Map<string, CacheEntry<DocumentConfig>>()
  private bankInfoCache = new Map<string, CacheEntry<BankInfo>>()
  
  private readonly cacheTimeout: number

  constructor() {
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

  private isCacheEntryValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false
    return (Date.now() - entry.timestamp) <= this.cacheTimeout
  }

  private buildConfigUrl(configName: string, fi: string | null, lng: string): string {
    const localizedConfigName = lng === 'en' ? configName : `${configName}.${lng}`
    const apiBaseUrl = getApiUrl()
    
    if (fi) {
      return `${apiBaseUrl}/config/${fi}/${localizedConfigName}`
    }
    
    return `${apiBaseUrl}/config/${localizedConfigName}`
  }

  /**
   * Generic method to get cached data or fetch if not available/expired
   */
  private async getCachedData<T>(
    cache: Map<string, CacheEntry<T>>,
    cacheKey: string,
    fetchFn: () => Promise<T>,
    fallbackData: T
  ): Promise<T> {
    const cached = cache.get(cacheKey)
    
    if (this.isCacheEntryValid(cached)) {
      return cached!.data
    }

    try {
      const data = await fetchFn()
      cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
      return data
    } catch (error) {
      console.error('Failed to load configuration:', error)
      // Return cached data if available, otherwise fallback
      return cached?.data || fallbackData
    }
  }

  /**
   * Get states for specific bank/language combination
   */
  async getStatesFor(fi: string | null, lng: string): Promise<State[]> {
    const cacheKey = createCacheKey(fi, lng)
    
    return this.getCachedData(
      this.statesCache,
      cacheKey,
      async () => {
        const response = await fetch(this.buildConfigUrl('states', fi, lng))
        if (!response.ok) {
          throw new Error(`Failed to fetch states: ${response.status}`)
        }
        return await response.json() as State[]
      },
      []
    )
  }

  /**
   * Get countries for specific bank/language combination
   */
  async getCountriesFor(fi: string | null, lng: string): Promise<Country[]> {
    const cacheKey = createCacheKey(fi, lng)
    
    return this.getCachedData(
      this.countriesCache,
      cacheKey,
      async () => {
        const response = await fetch(this.buildConfigUrl('countries', fi, lng))
        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.status}`)
        }
        return await response.json() as Country[]
      },
      []
    )
  }

  /**
   * Get identification types for specific bank/language combination
   */
  async getIdentificationTypesFor(fi: string | null, lng: string): Promise<IdentificationType[]> {
    const cacheKey = createCacheKey(fi, lng)
    
    return this.getCachedData(
      this.identificationTypesCache,
      cacheKey,
      async () => {
        const response = await fetch(this.buildConfigUrl('identification-types', fi, lng))
        if (!response.ok) {
          throw new Error(`Failed to fetch identification types: ${response.status}`)
        }
        return await response.json() as IdentificationType[]
      },
      []
    )
  }

  /**
   * Get products for specific bank/language combination
   */
  async getProductsFor(fi: string | null, lng: string): Promise<Product[]> {
    const cacheKey = createCacheKey(fi, lng)
    
    return this.getCachedData(
      this.productsCache,
      cacheKey,
      async () => {
        const response = await fetch(this.buildConfigUrl('products', fi, lng))
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`)
        }
        return await response.json() as Product[]
      },
      []
    )
  }

  /**
   * Get documents for specific bank/language combination
   */
  async getDocumentsFor(fi: string | null, lng: string): Promise<DocumentConfig> {
    const cacheKey = createCacheKey(fi, lng)
    
    return this.getCachedData(
      this.documentsCache,
      cacheKey,
      async () => {
        const response = await fetch(this.buildConfigUrl('documents', fi, lng))
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.status}`)
        }
        return await response.json() as DocumentConfig
      },
      { showAcceptAllButton: true, documents: [], rules: [] }
    )
  }

  /**
   * Get bank info for specific bank/language combination
   */
  async getBankInfoFor(fi: string | null, lng: string): Promise<BankInfo> {
    const cacheKey = createCacheKey(fi, lng)
    
    return this.getCachedData(
      this.bankInfoCache,
      cacheKey,
      async () => {
        const response = await fetch(this.buildConfigUrl('bank-info', fi, lng))
        if (!response.ok) {
          throw new Error(`Failed to fetch bank info: ${response.status}`)
        }
        return await response.json() as BankInfo
      },
      {
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
    )
  }

  // Backwards-compatible methods that get current URL parameters
  private getCurrentUrlParams(): { fi: string | null, lng: string } {
    if (typeof window === 'undefined') {
      return { fi: null, lng: 'en' }
    }
    
    const urlParams = new URLSearchParams(window.location.search)
    const fi = urlParams.get('fi')
    
    // Priority: URL param > localStorage > default
    let lng = urlParams.get('lng')
    if (!lng && typeof window !== 'undefined') {
      lng = localStorage.getItem('i18nextLng') || 'en'
    }
    lng = lng || 'en'
    
    return { fi, lng }
  }

  async getStates(): Promise<State[]> {
    const { fi, lng } = this.getCurrentUrlParams()
    return this.getStatesFor(fi, lng)
  }

  async getCountries(): Promise<Country[]> {
    const { fi, lng } = this.getCurrentUrlParams()
    return this.getCountriesFor(fi, lng)
  }

  async getIdentificationTypes(): Promise<IdentificationType[]> {
    const { fi, lng } = this.getCurrentUrlParams()
    return this.getIdentificationTypesFor(fi, lng)
  }

  async getProducts(): Promise<Product[]> {
    const { fi, lng } = this.getCurrentUrlParams()
    return this.getProductsFor(fi, lng)
  }

  async getDocuments(): Promise<DocumentConfig> {
    const { fi, lng } = this.getCurrentUrlParams()
    return this.getDocumentsFor(fi, lng)
  }

  async getBankInfo(): Promise<BankInfo> {
    const { fi, lng } = this.getCurrentUrlParams()
    return this.getBankInfoFor(fi, lng)
  }

  /**
   * Preload configurations for specific combinations
   * Useful for preloading common language/bank combinations
   */
  async preloadConfiguration(fi: string | null, lng: string): Promise<void> {
    await Promise.all([
      this.getProductsFor(fi, lng),
      this.getBankInfoFor(fi, lng),
      this.getStatesFor(fi, lng),
      this.getCountriesFor(fi, lng),
      this.getIdentificationTypesFor(fi, lng),
      this.getDocumentsFor(fi, lng)
    ])
  }

  /**
   * Preload both English and Spanish for current bank
   */
  async preloadLanguages(fi: string | null): Promise<void> {
    await Promise.all([
      this.preloadConfiguration(fi, 'en'),
      this.preloadConfiguration(fi, 'es')
    ])
  }

  /**
   * Clear all caches (for testing or manual refresh)
   */
  clearAllCaches(): void {
    this.statesCache.clear()
    this.countriesCache.clear()
    this.identificationTypesCache.clear()
    this.productsCache.clear()
    this.documentsCache.clear()
    this.bankInfoCache.clear()
  }

  /**
   * Clear cache for specific combination
   */
  clearCacheFor(fi: string | null, lng: string): void {
    const cacheKey = createCacheKey(fi, lng)
    this.statesCache.delete(cacheKey)
    this.countriesCache.delete(cacheKey)
    this.identificationTypesCache.delete(cacheKey)
    this.productsCache.delete(cacheKey)
    this.documentsCache.delete(cacheKey)
    this.bankInfoCache.delete(cacheKey)
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): Record<string, number> {
    return {
      statesEntries: this.statesCache.size,
      countriesEntries: this.countriesCache.size,
      identificationTypesEntries: this.identificationTypesCache.size,
      productsEntries: this.productsCache.size,
      documentsEntries: this.documentsCache.size,
      bankInfoEntries: this.bankInfoCache.size,
    }
  }

  // Helper method to get identification types that require state
  async getIdentificationTypesThatRequireState(): Promise<string[]> {
    const types = await this.getIdentificationTypes()
    return types.filter(type => type.requiresState).map(type => type.value)
  }

  // DEPRECATED: kept for backwards compatibility, but no longer needed
  refreshForLanguageChange(): void {
    console.warn('refreshForLanguageChange() is deprecated - use reactive URL parameter approach instead')
  }

  getCurrentFinancialInstitution(): string | null {
    const { fi } = this.getCurrentUrlParams()
    return fi
  }

  clearCache(): void {
    console.warn('clearCache() is deprecated - use clearAllCaches() instead')
    this.clearAllCaches()
  }
}

// Export singleton instance
export const configService = new ConfigService()