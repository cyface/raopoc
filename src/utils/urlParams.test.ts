import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getFinancialInstitutionSlug, isDarkModeRequested, getUrlParams } from './urlParams'

// Mock window.location
const mockLocation = {
  search: '',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

describe('URL Parameters Utilities', () => {
  beforeEach(() => {
    mockLocation.search = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('getFinancialInstitutionSlug', () => {
    it('returns null when no fi parameter is present', () => {
      mockLocation.search = ''
      expect(getFinancialInstitutionSlug()).toBeNull()
    })

    it('returns null when fi parameter is empty', () => {
      mockLocation.search = '?fi='
      expect(getFinancialInstitutionSlug()).toBeNull()
    })

    it('returns the fi parameter value when present', () => {
      mockLocation.search = '?fi=warmbank'
      expect(getFinancialInstitutionSlug()).toBe('warmbank')
    })

    it('returns the fi parameter value when multiple parameters are present', () => {
      mockLocation.search = '?lng=es&fi=coolbank&dark=1'
      expect(getFinancialInstitutionSlug()).toBe('coolbank')
    })

    it('handles URL encoding in fi parameter', () => {
      mockLocation.search = '?fi=test%20bank'
      expect(getFinancialInstitutionSlug()).toBe('test bank')
    })

    it('returns null in server-side environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - intentionally deleting global.window for server-side testing
      delete global.window
      
      expect(getFinancialInstitutionSlug()).toBeNull()
      
      global.window = originalWindow
    })
  })

  describe('isDarkModeRequested', () => {
    it('returns false when no dark parameter is present', () => {
      mockLocation.search = ''
      expect(isDarkModeRequested()).toBe(false)
    })

    it('returns false when dark parameter is not "1"', () => {
      mockLocation.search = '?dark=0'
      expect(isDarkModeRequested()).toBe(false)
      
      mockLocation.search = '?dark=true'
      expect(isDarkModeRequested()).toBe(false)
      
      mockLocation.search = '?dark=yes'
      expect(isDarkModeRequested()).toBe(false)
    })

    it('returns true when dark parameter is "1"', () => {
      mockLocation.search = '?dark=1'
      expect(isDarkModeRequested()).toBe(true)
    })

    it('returns true when dark=1 and other parameters are present', () => {
      mockLocation.search = '?fi=warmbank&dark=1&lng=es'
      expect(isDarkModeRequested()).toBe(true)
    })

    it('returns false in server-side environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - intentionally deleting global.window for server-side testing
      delete global.window
      
      expect(isDarkModeRequested()).toBe(false)
      
      global.window = originalWindow
    })
  })

  describe('getUrlParams', () => {
    it('returns empty object when no parameters are present', () => {
      mockLocation.search = ''
      expect(getUrlParams()).toEqual({})
    })

    it('returns single parameter', () => {
      mockLocation.search = '?fi=warmbank'
      expect(getUrlParams()).toEqual({ fi: 'warmbank' })
    })

    it('returns multiple parameters', () => {
      mockLocation.search = '?fi=warmbank&lng=es&dark=1'
      expect(getUrlParams()).toEqual({
        fi: 'warmbank',
        lng: 'es',
        dark: '1'
      })
    })

    it('handles URL encoding in parameter values', () => {
      mockLocation.search = '?name=test%20bank&description=cool%20bank%20description'
      expect(getUrlParams()).toEqual({
        name: 'test bank',
        description: 'cool bank description'
      })
    })

    it('handles empty parameter values', () => {
      mockLocation.search = '?fi=&lng=es&dark='
      expect(getUrlParams()).toEqual({
        fi: '',
        lng: 'es',
        dark: ''
      })
    })

    it('handles duplicate parameter names (returns last value)', () => {
      mockLocation.search = '?fi=bank1&fi=bank2&lng=es'
      expect(getUrlParams()).toEqual({
        fi: 'bank2',
        lng: 'es'
      })
    })

    it('returns empty object in server-side environment', () => {
      const originalWindow = global.window
      // @ts-expect-error - intentionally deleting global.window for server-side testing
      delete global.window
      
      expect(getUrlParams()).toEqual({})
      
      global.window = originalWindow
    })
  })

  describe('URL Parameter Integration Scenarios', () => {
    it('correctly identifies bank and language configuration', () => {
      mockLocation.search = '?fi=warmbank&lng=es'
      
      expect(getFinancialInstitutionSlug()).toBe('warmbank')
      expect(getUrlParams()).toEqual({
        fi: 'warmbank',
        lng: 'es'
      })
    })

    it('correctly identifies bank, language, and theme configuration', () => {
      mockLocation.search = '?fi=coolbank&lng=es&dark=1'
      
      expect(getFinancialInstitutionSlug()).toBe('coolbank')
      expect(isDarkModeRequested()).toBe(true)
      expect(getUrlParams()).toEqual({
        fi: 'coolbank',
        lng: 'es',
        dark: '1'
      })
    })

    it('handles real-world URL scenarios', () => {
      mockLocation.search = '?utm_source=email&fi=warmbank&lng=es&utm_campaign=onboarding'
      
      expect(getFinancialInstitutionSlug()).toBe('warmbank')
      expect(isDarkModeRequested()).toBe(false)
      expect(getUrlParams()).toEqual({
        utm_source: 'email',
        fi: 'warmbank',
        lng: 'es',
        utm_campaign: 'onboarding'
      })
    })
  })
})