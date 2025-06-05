import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { configServiceV2 } from './configService.v2'
import { createCacheKey } from '../hooks/useUrlParams'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock window.location
const mockLocation = {
  href: 'http://localhost:3000',
  search: '',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})

describe('ConfigService V2 - Multi-Dimensional Caching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = 'http://localhost:3000'
    mockLocation.search = ''
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Clear service cache
    configServiceV2.clearAllCaches()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Cache Key Generation', () => {
    it('creates correct cache keys for different combinations', () => {
      expect(createCacheKey(null, 'en')).toBe('default-en')
      expect(createCacheKey('warmbank', 'en')).toBe('warmbank-en')
      expect(createCacheKey('warmbank', 'es')).toBe('warmbank-es')
      expect(createCacheKey('coolbank', 'es')).toBe('coolbank-es')
    })
  })

  describe('Multi-Language Caching', () => {
    it('caches English and Spanish products separately', async () => {
      const englishProducts = [
        { type: 'checking', title: 'Checking Account', description: 'English description', icon: 'CreditCard' }
      ]
      const spanishProducts = [
        { type: 'checking', title: 'Cuenta Corriente', description: 'Descripción en español', icon: 'CreditCard' }
      ]

      // Mock English response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(englishProducts)
      })

      // Mock Spanish response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(spanishProducts)
      })

      // Load English products
      const englishResult = await configServiceV2.getProductsFor(null, 'en')
      expect(englishResult).toEqual(englishProducts)
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/products')

      // Load Spanish products
      const spanishResult = await configServiceV2.getProductsFor(null, 'es')
      expect(spanishResult).toEqual(spanishProducts)
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/products.es')

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('returns cached data instantly on subsequent requests', async () => {
      const englishProducts = [
        { type: 'checking', title: 'Checking Account', description: 'English description', icon: 'CreditCard' }
      ]

      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(englishProducts)
      })

      // First call - should fetch
      const firstResult = await configServiceV2.getProductsFor(null, 'en')
      expect(firstResult).toEqual(englishProducts)
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call - should use cache (no fetch)
      const secondResult = await configServiceV2.getProductsFor(null, 'en')
      expect(secondResult).toEqual(englishProducts)
      expect(mockFetch).toHaveBeenCalledTimes(1) // No additional fetch

      // Third call with different language - should fetch again
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ type: 'checking', title: 'Cuenta Corriente', description: 'Spanish', icon: 'CreditCard' }])
      })

      await configServiceV2.getProductsFor(null, 'es')
      expect(mockFetch).toHaveBeenCalledTimes(2) // One additional fetch
    })
  })

  describe('Multi-Bank Caching', () => {
    it('caches configurations for different banks separately', async () => {
      const defaultBankInfo = {
        bankName: 'Default Bank',
        displayName: 'Default Bank',
        contact: { phone: '1-800-DEFAULT', phoneDisplay: '1-800-DEFAULT', email: 'default@bank.com', hours: '24/7' },
        branding: { primaryColor: '#000', logoIcon: 'Building2' }
      }

      const warmBankInfo = {
        bankName: 'Warm Bank',
        displayName: 'Warm Banking Solutions',
        contact: { phone: '1-800-WARM', phoneDisplay: '1-800-WARM', email: 'warm@bank.com', hours: 'Always' },
        branding: { primaryColor: '#10b981', logoIcon: 'Leaf' }
      }

      // Mock responses
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(defaultBankInfo)
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(warmBankInfo)
      })

      // Load default bank info
      const defaultResult = await configServiceV2.getBankInfoFor(null, 'en')
      expect(defaultResult).toEqual(defaultBankInfo)
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/bank-info')

      // Load warm bank info
      const warmResult = await configServiceV2.getBankInfoFor('warmbank', 'en')
      expect(warmResult).toEqual(warmBankInfo)
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/warmbank/bank-info')

      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Subsequent calls should use cache
      const cachedDefaultResult = await configServiceV2.getBankInfoFor(null, 'en')
      const cachedWarmResult = await configServiceV2.getBankInfoFor('warmbank', 'en')
      
      expect(cachedDefaultResult).toEqual(defaultBankInfo)
      expect(cachedWarmResult).toEqual(warmBankInfo)
      expect(mockFetch).toHaveBeenCalledTimes(2) // No additional fetches
    })
  })

  describe('Combined Bank and Language Caching', () => {
    it('caches all four combinations separately: default/warm × en/es', async () => {
      const combinations = [
        { fi: null, lng: 'en', expectedUrl: 'http://127.0.0.1:3001/api/config/products' },
        { fi: null, lng: 'es', expectedUrl: 'http://127.0.0.1:3001/api/config/products.es' },
        { fi: 'warmbank', lng: 'en', expectedUrl: 'http://127.0.0.1:3001/api/config/warmbank/products' },
        { fi: 'warmbank', lng: 'es', expectedUrl: 'http://127.0.0.1:3001/api/config/warmbank/products.es' }
      ]

      // Mock responses for each combination
      for (let i = 0; i < combinations.length; i++) {
        const combo = combinations[i]
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { type: 'checking', title: `${combo.fi || 'default'}-${combo.lng}`, description: 'test', icon: 'CreditCard' }
          ])
        })
      }

      // Load all combinations
      const results = []
      for (const combo of combinations) {
        results.push(await configServiceV2.getProductsFor(combo.fi, combo.lng))
      }

      // Verify correct URLs were called
      expect(mockFetch).toHaveBeenCalledTimes(4)
      combinations.forEach((combo, index) => {
        expect(mockFetch).toHaveBeenNthCalledWith(index + 1, combo.expectedUrl)
      })

      // Verify different data was cached for each combination
      expect(results[0][0].title).toBe('default-en')
      expect(results[1][0].title).toBe('default-es')
      expect(results[2][0].title).toBe('warmbank-en')
      expect(results[3][0].title).toBe('warmbank-es')

      // Verify subsequent calls use cache
      const cachedResult = await configServiceV2.getProductsFor('warmbank', 'es')
      expect(cachedResult[0].title).toBe('warmbank-es')
      expect(mockFetch).toHaveBeenCalledTimes(4) // No additional fetch
    })
  })

  describe('Preloading', () => {
    it('preloads both languages for a bank', async () => {
      // Mock responses for both languages
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      })

      await configServiceV2.preloadLanguages('warmbank')

      // Should have called 12 endpoints (6 config types × 2 languages)
      expect(mockFetch).toHaveBeenCalledTimes(12)
      
      // Check some specific calls
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/warmbank/products')
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/warmbank/products.es')
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/warmbank/bank-info')
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/warmbank/bank-info.es')
    })

    it('makes subsequent access instant after preloading', async () => {
      // Mock responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([
          { type: 'checking', title: 'Preloaded', description: 'test', icon: 'CreditCard' }
        ])
      })

      // Preload configuration
      await configServiceV2.preloadConfiguration('warmbank', 'es')
      expect(mockFetch).toHaveBeenCalledTimes(6) // 6 config types

      vi.clearAllMocks()

      // Access preloaded data - should be instant (no fetch)
      const products = await configServiceV2.getProductsFor('warmbank', 'es')
      expect(products[0].title).toBe('Preloaded')
      expect(mockFetch).toHaveBeenCalledTimes(0) // No additional fetches
    })
  })

  describe('Cache Statistics', () => {
    it('tracks cache entries correctly', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      })

      // Load some configurations
      await configServiceV2.getProductsFor(null, 'en')
      await configServiceV2.getProductsFor('warmbank', 'es')
      await configServiceV2.getBankInfoFor(null, 'en')

      const stats = configServiceV2.getCacheStats()
      expect(stats.productsEntries).toBe(2) // default-en, warmbank-es
      expect(stats.bankInfoEntries).toBe(1) // default-en
      expect(stats.statesEntries).toBe(0) // Not loaded yet
    })
  })

  describe('Backwards Compatibility', () => {
    it('maintains backwards compatibility with old API', async () => {
      mockLocation.search = '?fi=warmbank&lng=es'
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { type: 'checking', title: 'Backward Compatible', description: 'test', icon: 'CreditCard' }
        ])
      })

      // Old API should still work
      const products = await configServiceV2.getProducts()
      expect(products[0].title).toBe('Backward Compatible')
      expect(mockFetch).toHaveBeenCalledWith('http://127.0.0.1:3001/api/config/warmbank/products.es')
    })
  })

  describe('Performance Benefits', () => {
    it('demonstrates instant switching between cached configurations', async () => {
      const englishProducts = [{ type: 'checking', title: 'English', description: 'test', icon: 'CreditCard' }]
      const spanishProducts = [{ type: 'checking', title: 'Spanish', description: 'test', icon: 'CreditCard' }]

      // Initial loads (will make network calls)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(englishProducts)
      })
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(spanishProducts)
      })

      await configServiceV2.getProductsFor('warmbank', 'en')
      await configServiceV2.getProductsFor('warmbank', 'es')
      expect(mockFetch).toHaveBeenCalledTimes(2)

      // Clear mock to verify no more calls
      vi.clearAllMocks()

      // Simulate rapid language switching - should be instant
      for (let i = 0; i < 10; i++) {
        const lng = i % 2 === 0 ? 'en' : 'es'
        const expectedTitle = lng === 'en' ? 'English' : 'Spanish'
        
        const result = await configServiceV2.getProductsFor('warmbank', lng)
        expect(result[0].title).toBe(expectedTitle)
      }

      // No additional network calls should have been made
      expect(mockFetch).toHaveBeenCalledTimes(0)
    })
  })
})