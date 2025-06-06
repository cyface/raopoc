import { z } from 'zod'

// Schema for translation data - flat key structure
const TranslationSchema = z.record(z.string())
type TranslationData = z.infer<typeof TranslationSchema>

// Schema for translation manifest
const TranslationManifestSchema = z.object({
  languages: z.array(z.string()),
  namespaces: z.array(z.string()),
  version: z.string().optional(),
  lastModified: z.string().optional()
})

export interface TranslationLoaderConfig {
  // Base URL for API
  apiUrl?: string
  // Cache translations in memory/localStorage
  enableCache?: boolean
  // Cache TTL in milliseconds (default: 5 minutes)
  cacheTTL?: number
  // Fallback language
  fallbackLng?: string
}

export class TranslationLoader {
  private config: Required<TranslationLoaderConfig>
  private cache: Map<string, { data: any; timestamp: number }> = new Map()

  constructor(config: TranslationLoaderConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
      enableCache: config.enableCache ?? true,
      cacheTTL: config.cacheTTL || 300000, // 5 minutes
      fallbackLng: config.fallbackLng || 'en'
    }

    // Load cache from localStorage on init
    if (this.config.enableCache && typeof window !== 'undefined') {
      this.loadCacheFromStorage()
    }
  }

  /**
   * Load all translation namespaces for a language
   */
  async loadLanguage(language: string): Promise<Record<string, TranslationData>> {
    const cacheKey = `all-${language}`
    
    // Check cache first
    if (this.config.enableCache) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached as Record<string, TranslationData>
    }

    try {
      // Load all translations for this language from API
      const response = await fetch(`${this.config.apiUrl}/translations/${language}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`)
      }

      const data = await response.json()
      
      // Cache the result
      if (this.config.enableCache) {
        this.setCache(cacheKey, data)
      }

      return data
    } catch (error) {
      console.error(`Failed to load translations for ${language}`, error)
      
      // Try fallback language if different
      if (language !== this.config.fallbackLng) {
        console.warn(`Falling back to ${this.config.fallbackLng}`)
        return this.loadLanguage(this.config.fallbackLng)
      }
      
      throw error
    }
  }

  /**
   * Load a specific namespace for a language
   */
  async loadNamespace(language: string, namespace: string): Promise<TranslationData> {
    const cacheKey = `${language}/${namespace}`

    // Check cache first
    if (this.config.enableCache) {
      const cached = this.getFromCache(cacheKey)
      if (cached) return cached
    }

    try {
      // Load specific namespace from API
      const response = await fetch(`${this.config.apiUrl}/translations/${language}/${namespace}`)
      
      if (!response.ok) {
        throw new Error(`Failed to load namespace: ${response.status}`)
      }

      const data = await response.json()
      const parsed = TranslationSchema.parse(data)
      
      // Cache the result
      if (this.config.enableCache) {
        this.setCache(cacheKey, parsed)
      }

      return parsed
    } catch (error) {
      console.error(`Failed to load ${namespace} for ${language}`, error)
      
      // Try fallback language if different
      if (language !== this.config.fallbackLng) {
        console.warn(`Falling back to ${this.config.fallbackLng}`)
        return this.loadNamespace(this.config.fallbackLng, namespace)
      }
      
      return {}
    }
  }

  /**
   * Get available languages and namespaces
   */
  async getManifest() {
    try {
      const response = await fetch(`${this.config.apiUrl}/translations/manifest`)
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status}`)
      }
      
      const data = await response.json()
      return TranslationManifestSchema.parse(data)
    } catch (error) {
      console.error('Failed to load translation manifest', error)
      // Return default manifest
      return {
        languages: ['en', 'es'],
        namespaces: []
      }
    }
  }

  /**
   * Clear all cached translations
   */
  clearCache() {
    this.cache.clear()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('i18n-cache')
    }
  }

  /**
   * Force reload translations (bypass cache)
   */
  async reloadLanguage(language: string) {
    // Clear cache entries for this language
    const keysToDelete: string[] = []
    this.cache.forEach((_, key) => {
      if (key.startsWith(language) || key === `all-${language}`) {
        keysToDelete.push(key)
      }
    })
    keysToDelete.forEach(key => this.cache.delete(key))

    // Reload from API
    return this.loadLanguage(language)
  }

  // Private cache management methods
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > this.config.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      this.saveCacheToStorage()
    }
  }

  private loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem('i18n-cache')
      if (!stored) return

      const parsed = JSON.parse(stored)
      const now = Date.now()

      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        if (now - value.timestamp <= this.config.cacheTTL) {
          this.cache.set(key, value)
        }
      })
    } catch (error) {
      console.warn('Failed to load i18n cache from storage', error)
    }
  }

  private saveCacheToStorage() {
    try {
      const cacheObj: Record<string, any> = {}
      this.cache.forEach((value, key) => {
        cacheObj[key] = value
      })
      localStorage.setItem('i18n-cache', JSON.stringify(cacheObj))
    } catch (error) {
      console.warn('Failed to save i18n cache to storage', error)
    }
  }
}