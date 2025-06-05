export interface State {
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

class ConfigService {
  private statesCache: State[] | null = null
  private identificationTypesCache: IdentificationType[] | null = null
  private productsCache: Product[] | null = null
  private lastStatesLoad = 0
  private lastIdentificationTypesLoad = 0
  private lastProductsLoad = 0
  private readonly cacheTimeout: number
  private readonly apiBaseUrl: string

  constructor() {
    // Get API base URL from environment variable, default to local development server
    this.apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'
    
    // Get cache timeout from environment variable, default to 5000ms (5 seconds)
    const envCacheTimeout = (import.meta as any).env?.VITE_CONFIG_CACHE_TIMEOUT
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

  private shouldReloadIdentificationTypes(): boolean {
    return this.identificationTypesCache === null || (Date.now() - this.lastIdentificationTypesLoad) > this.cacheTimeout
  }

  private shouldReloadProducts(): boolean {
    return this.productsCache === null || (Date.now() - this.lastProductsLoad) > this.cacheTimeout
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

  clearCache(): void {
    this.statesCache = null
    this.identificationTypesCache = null
    this.productsCache = null
    this.lastStatesLoad = 0
    this.lastIdentificationTypesLoad = 0
    this.lastProductsLoad = 0
  }

  // Helper method to get identification types that require state
  async getIdentificationTypesThatRequireState(): Promise<string[]> {
    const types = await this.getIdentificationTypes()
    return types.filter(type => type.requiresState).map(type => type.value)
  }
}

// Export singleton instance
export const configService = new ConfigService()