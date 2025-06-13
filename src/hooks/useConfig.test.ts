import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useProducts, useBankInfo, useProductsAndBankInfo } from './useConfig'
import { configService } from '../services/configService'
import type { Product } from '../services/configService'

// Mock the configService
vi.mock('../services/configService', () => ({
  configService: {
    getProductsFor: vi.fn(),
    getBankInfoFor: vi.fn(),
    preloadLanguages: vi.fn(),
  }
}))

// Mock the useUrlParams hook
vi.mock('./useUrlParams', () => ({
  useUrlParams: vi.fn()
}))

import { useUrlParams } from './useUrlParams'

const mockUseUrlParams = vi.mocked(useUrlParams)

// Mock data
const mockEnglishProducts = [
  { type: 'checking', title: 'Checking Account', description: 'English checking account', icon: 'CreditCard' },
  { type: 'savings', title: 'Savings Account', description: 'English savings account', icon: 'PiggyBank' }
]

const mockSpanishProducts = [
  { type: 'checking', title: 'Cuenta Corriente', description: 'Cuenta corriente en español', icon: 'CreditCard' },
  { type: 'savings', title: 'Cuenta de Ahorros', description: 'Cuenta de ahorros en español', icon: 'PiggyBank' }
]

const mockDefaultBankInfo = {
  bankName: 'Default Bank',
  displayName: 'Default Bank',
  contact: {
    phone: '1-800-DEFAULT',
    phoneDisplay: '1-800-DEFAULT',
    email: 'support@default.com',
    hours: '24/7'
  },
  branding: {
    primaryColor: '#3b82f6',
    logoIcon: 'Building2'
  }
}

const mockWarmBankInfo = {
  bankName: 'Warm Bank',
  displayName: 'Warm Banking Solutions',
  theme: 'greenLight' as const,
  contact: {
    phone: '1-800-WARM',
    phoneDisplay: '1-800-WARM',
    email: 'support@warmbank.com',
    hours: 'Always available'
  },
  branding: {
    primaryColor: '#10b981',
    logoIcon: 'Leaf'
  }
}

describe('Configuration Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Default mock values
    mockUseUrlParams.mockReturnValue({
      fi: null,
      lng: 'en',
      dark: null,
      devStep: null,
      mockScenario: null
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useProducts Hook', () => {
    it('loads products on initial render', async () => {
      vi.mocked(configService.getProductsFor).mockResolvedValue(mockEnglishProducts)
      
      const { result } = renderHook(() => useProducts())
      
      expect(result.current.loading).toBe(true)
      expect(result.current.products).toEqual([])
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.products).toEqual(mockEnglishProducts)
        expect(result.current.error).toBeNull()
      })
      
      expect(configService.getProductsFor).toHaveBeenCalledWith(null, 'en')
    })

    it('reloads products when language changes', async () => {
      vi.mocked(configService.getProductsFor)
        .mockResolvedValueOnce(mockEnglishProducts)
        .mockResolvedValueOnce(mockSpanishProducts)
      
      const { result, rerender } = renderHook(() => useProducts())
      
      // Initial load (English)
      await waitFor(() => {
        expect(result.current.products).toEqual(mockEnglishProducts)
      })
      
      expect(configService.getProductsFor).toHaveBeenCalledWith(null, 'en')
      
      // Change to Spanish
      mockUseUrlParams.mockReturnValue({
        fi: null,
        lng: 'es',
        dark: null,
        devStep: null,
        mockScenario: null
      })
      
      rerender()
      
      // Should reload with Spanish
      await waitFor(() => {
        expect(result.current.products).toEqual(mockSpanishProducts)
      })
      
      expect(configService.getProductsFor).toHaveBeenCalledWith(null, 'es')
      expect(configService.getProductsFor).toHaveBeenCalledTimes(2)
    })

    it('reloads products when bank changes', async () => {
      const defaultProducts = mockEnglishProducts
      const warmBankProducts = [
        { type: 'eco-savings', title: 'Eco Savings', description: 'Green savings', icon: 'PiggyBank' }
      ]
      
      vi.mocked(configService.getProductsFor)
        .mockResolvedValueOnce(defaultProducts)
        .mockResolvedValueOnce(warmBankProducts)
      
      const { result, rerender } = renderHook(() => useProducts())
      
      // Initial load (default bank)
      await waitFor(() => {
        expect(result.current.products).toEqual(defaultProducts)
      })
      
      expect(configService.getProductsFor).toHaveBeenCalledWith(null, 'en')
      
      // Change to warm bank
      mockUseUrlParams.mockReturnValue({
        fi: 'warmbank',
        lng: 'en',
        dark: null,
        devStep: null,
        mockScenario: null
      })
      
      rerender()
      
      // Should reload with warm bank products
      await waitFor(() => {
        expect(result.current.products).toEqual(warmBankProducts)
      })
      
      expect(configService.getProductsFor).toHaveBeenCalledWith('warmbank', 'en')
      expect(configService.getProductsFor).toHaveBeenCalledTimes(2)
    })

    it('handles both bank and language changes simultaneously', async () => {
      const warmBankSpanishProducts = [
        { type: 'eco-savings', title: 'Ahorros Ecológicos', description: 'Ahorros verdes', icon: 'PiggyBank' }
      ]
      
      vi.mocked(configService.getProductsFor)
        .mockResolvedValueOnce(mockEnglishProducts)
        .mockResolvedValueOnce(warmBankSpanishProducts)
      
      const { result, rerender } = renderHook(() => useProducts())
      
      // Initial load (default bank, English)
      await waitFor(() => {
        expect(result.current.products).toEqual(mockEnglishProducts)
      })
      
      // Change to warm bank + Spanish
      mockUseUrlParams.mockReturnValue({
        fi: 'warmbank',
        lng: 'es',
        dark: null,
        devStep: null,
        mockScenario: null
      })
      
      rerender()
      
      // Should reload with warm bank Spanish products
      await waitFor(() => {
        expect(result.current.products).toEqual(warmBankSpanishProducts)
      })
      
      expect(configService.getProductsFor).toHaveBeenCalledWith('warmbank', 'es')
    })

    it('handles loading errors gracefully', async () => {
      const errorMessage = 'Failed to load products'
      vi.mocked(configService.getProductsFor).mockRejectedValue(new Error(errorMessage))
      
      const { result } = renderHook(() => useProducts())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe(errorMessage)
        expect(result.current.products).toEqual([])
      })
    })

    it('cancels previous requests when parameters change quickly', async () => {
      // Mock a slow response
      const slowResponse = new Promise<Product[]>(resolve => setTimeout(() => resolve(mockEnglishProducts), 100))
      const fastResponse = Promise.resolve(mockSpanishProducts)
      
      vi.mocked(configService.getProductsFor)
        .mockReturnValueOnce(slowResponse)
        .mockReturnValueOnce(fastResponse)
      
      const { result, rerender } = renderHook(() => useProducts())
      
      // Start with English (slow response)
      expect(result.current.loading).toBe(true)
      
      // Quickly change to Spanish before English loads
      mockUseUrlParams.mockReturnValue({
        fi: null,
        lng: 'es',
        dark: null,
        devStep: null,
        mockScenario: null
      })
      
      rerender()
      
      // Should end up with Spanish products, not English
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.products).toEqual(mockSpanishProducts)
      })
    })
  })

  describe('useBankInfo Hook', () => {
    it('loads bank info on initial render', async () => {
      vi.mocked(configService.getBankInfoFor).mockResolvedValue(mockDefaultBankInfo)
      
      const { result } = renderHook(() => useBankInfo())
      
      expect(result.current.loading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.bankInfo).toEqual(mockDefaultBankInfo)
        expect(result.current.error).toBeNull()
      })
      
      expect(configService.getBankInfoFor).toHaveBeenCalledWith(null, 'en')
    })

    it('reloads bank info when bank changes', async () => {
      vi.mocked(configService.getBankInfoFor)
        .mockResolvedValueOnce(mockDefaultBankInfo)
        .mockResolvedValueOnce(mockWarmBankInfo)
      
      const { result, rerender } = renderHook(() => useBankInfo())
      
      // Initial load (default bank)
      await waitFor(() => {
        expect(result.current.bankInfo).toEqual(mockDefaultBankInfo)
      })
      
      // Change to warm bank
      mockUseUrlParams.mockReturnValue({
        fi: 'warmbank',
        lng: 'en',
        dark: null,
        devStep: null,
        mockScenario: null
      })
      
      rerender()
      
      // Should reload with warm bank info
      await waitFor(() => {
        expect(result.current.bankInfo).toEqual(mockWarmBankInfo)
      })
      
      expect(configService.getBankInfoFor).toHaveBeenCalledWith('warmbank', 'en')
    })
  })

  describe('useProductsAndBankInfo Hook', () => {
    it('loads both products and bank info efficiently', async () => {
      vi.mocked(configService.getProductsFor).mockResolvedValue(mockEnglishProducts)
      vi.mocked(configService.getBankInfoFor).mockResolvedValue(mockDefaultBankInfo)
      
      const { result } = renderHook(() => useProductsAndBankInfo())
      
      expect(result.current.loading).toBe(true)
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.products).toEqual(mockEnglishProducts)
        expect(result.current.bankInfo).toEqual(mockDefaultBankInfo)
        expect(result.current.error).toBeNull()
      })
      
      // Should call both services
      expect(configService.getProductsFor).toHaveBeenCalledWith(null, 'en')
      expect(configService.getBankInfoFor).toHaveBeenCalledWith(null, 'en')
    })

    it('reloads both when URL parameters change', async () => {
      const warmBankSpanishProducts = [
        { type: 'eco-savings', title: 'Ahorros Ecológicos', description: 'Green savings', icon: 'PiggyBank' }
      ]
      
      const warmBankSpanishInfo = {
        ...mockWarmBankInfo,
        bankName: 'Banco Cálido',
        displayName: 'Soluciones Bancarias Cálidas'
      }
      
      vi.mocked(configService.getProductsFor)
        .mockResolvedValueOnce(mockEnglishProducts)
        .mockResolvedValueOnce(warmBankSpanishProducts)
      
      vi.mocked(configService.getBankInfoFor)
        .mockResolvedValueOnce(mockDefaultBankInfo)
        .mockResolvedValueOnce(warmBankSpanishInfo)
      
      const { result, rerender } = renderHook(() => useProductsAndBankInfo())
      
      // Initial load
      await waitFor(() => {
        expect(result.current.products).toEqual(mockEnglishProducts)
        expect(result.current.bankInfo).toEqual(mockDefaultBankInfo)
      })
      
      // Change to warm bank + Spanish
      mockUseUrlParams.mockReturnValue({
        fi: 'warmbank',
        lng: 'es',
        dark: null,
        devStep: null,
        mockScenario: null
      })
      
      rerender()
      
      // Should reload both
      await waitFor(() => {
        expect(result.current.products).toEqual(warmBankSpanishProducts)
        expect(result.current.bankInfo).toEqual(warmBankSpanishInfo)
      })
      
      expect(configService.getProductsFor).toHaveBeenCalledWith('warmbank', 'es')
      expect(configService.getBankInfoFor).toHaveBeenCalledWith('warmbank', 'es')
    })

    it('handles partial failures gracefully', async () => {
      vi.mocked(configService.getProductsFor).mockResolvedValue(mockEnglishProducts)
      vi.mocked(configService.getBankInfoFor).mockRejectedValue(new Error('Bank info failed'))
      
      const { result } = renderHook(() => useProductsAndBankInfo())
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBe('Bank info failed')
        expect(result.current.products).toEqual([]) // Should be empty on error
        expect(result.current.bankInfo).toBeNull()
      })
    })
  })

  describe('Performance Optimizations', () => {
    it('demonstrates instant switching with cached data', async () => {
      // Simulate cached responses (instant resolution)
      vi.mocked(configService.getProductsFor)
        .mockResolvedValueOnce(mockEnglishProducts) // Cached English
        .mockResolvedValueOnce(mockSpanishProducts) // Cached Spanish
        .mockResolvedValueOnce(mockEnglishProducts) // Cached English again
      
      const { result, rerender } = renderHook(() => useProducts())
      
      // Initial load
      await waitFor(() => {
        expect(result.current.products).toEqual(mockEnglishProducts)
      })
      
      // Switch to Spanish - should be instant since it's cached
      mockUseUrlParams.mockReturnValue({
        fi: null,
        lng: 'es',
        dark: null,
        devStep: null,
        mockScenario: null
      })
      
      rerender()
      
      // Should update immediately (no loading state)
      await waitFor(() => {
        expect(result.current.products).toEqual(mockSpanishProducts)
      })
      
      // Switch back to English - should be instant
      mockUseUrlParams.mockReturnValue({
        fi: null,
        lng: 'en',
        dark: null,
        devStep: null,
        mockScenario: null
      })
      
      rerender()
      
      await waitFor(() => {
        expect(result.current.products).toEqual(mockEnglishProducts)
      })
      
      // All switches should be processed
      expect(configService.getProductsFor).toHaveBeenCalledTimes(3)
    })
  })
})