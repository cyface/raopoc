import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useUrlParams, createCacheKey, useConfigCacheKey } from './useUrlParams'

// Mock window.location and history
const mockLocation = {
  href: 'http://localhost:3000',
  search: '',
}

const mockHistory = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

Object.defineProperty(window, 'history', {
  value: mockHistory,
  writable: true,
})

describe('useUrlParams Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocation.href = 'http://localhost:3000'
    mockLocation.search = ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Parameter Reading', () => {
    it('returns default values when no parameters are present', () => {
      const { result } = renderHook(() => useUrlParams())
      
      expect(result.current).toEqual({
        fi: null,
        lng: 'en',
        dark: null
      })
    })

    it('reads fi parameter correctly', () => {
      mockLocation.search = '?fi=warmbank'
      
      const { result } = renderHook(() => useUrlParams())
      
      expect(result.current.fi).toBe('warmbank')
      expect(result.current.lng).toBe('en')
    })

    it('reads lng parameter correctly', () => {
      mockLocation.search = '?lng=es'
      
      const { result } = renderHook(() => useUrlParams())
      
      expect(result.current.fi).toBe(null)
      expect(result.current.lng).toBe('es')
    })

    it('reads multiple parameters correctly', () => {
      mockLocation.search = '?fi=warmbank&lng=es&dark=1'
      
      const { result } = renderHook(() => useUrlParams())
      
      expect(result.current).toEqual({
        fi: 'warmbank',
        lng: 'es',
        dark: '1'
      })
    })
  })

  describe('Reactive URL Changes', () => {
    it('updates when URL parameters change via replaceState', () => {
      const { result } = renderHook(() => useUrlParams())
      
      // Initial state
      expect(result.current.fi).toBe(null)
      expect(result.current.lng).toBe('en')
      
      // Simulate URL change
      act(() => {
        mockLocation.search = '?fi=warmbank&lng=es'
        // Trigger the replaceState that LanguageSwitcher would call
        window.history.replaceState({}, '', 'http://localhost:3000?fi=warmbank&lng=es')
      })
      
      expect(result.current.fi).toBe('warmbank')
      expect(result.current.lng).toBe('es')
    })

    it('updates when URL parameters change via pushState', () => {
      const { result } = renderHook(() => useUrlParams())
      
      expect(result.current.fi).toBe(null)
      
      act(() => {
        mockLocation.search = '?fi=coolbank'
        window.history.pushState({}, '', 'http://localhost:3000?fi=coolbank')
      })
      
      expect(result.current.fi).toBe('coolbank')
    })

    it('updates when URL parameters change via popstate (back/forward)', () => {
      const { result } = renderHook(() => useUrlParams())
      
      expect(result.current.fi).toBe(null)
      
      act(() => {
        mockLocation.search = '?fi=warmbank'
        // Simulate back/forward navigation
        window.dispatchEvent(new PopStateEvent('popstate'))
      })
      
      expect(result.current.fi).toBe('warmbank')
    })
  })

  describe('Real-world URL Change Scenarios', () => {
    it('handles language switching scenario', () => {
      mockLocation.search = '?fi=warmbank'
      const { result } = renderHook(() => useUrlParams())
      
      expect(result.current).toEqual({
        fi: 'warmbank',
        lng: 'en',
        dark: null
      })
      
      // Simulate LanguageSwitcher changing to Spanish
      act(() => {
        mockLocation.search = '?fi=warmbank&lng=es'
        window.history.replaceState({}, '', 'http://localhost:3000?fi=warmbank&lng=es')
      })
      
      expect(result.current).toEqual({
        fi: 'warmbank',
        lng: 'es',
        dark: null
      })
    })

    it('handles bank switching scenario', () => {
      mockLocation.search = '?lng=es'
      const { result } = renderHook(() => useUrlParams())
      
      expect(result.current).toEqual({
        fi: null,
        lng: 'es',
        dark: null
      })
      
      // Simulate navigation to different bank
      act(() => {
        mockLocation.search = '?fi=coolbank&lng=es'
        window.history.pushState({}, '', 'http://localhost:3000?fi=coolbank&lng=es')
      })
      
      expect(result.current).toEqual({
        fi: 'coolbank',
        lng: 'es',
        dark: null
      })
    })

    it('handles rapid parameter changes', () => {
      const { result } = renderHook(() => useUrlParams())
      
      // Rapid changes like user clicking language switcher multiple times
      const changes = [
        { search: '?lng=es', expected: { fi: null, lng: 'es', dark: null } },
        { search: '?fi=warmbank&lng=es', expected: { fi: 'warmbank', lng: 'es', dark: null } },
        { search: '?fi=warmbank&lng=en', expected: { fi: 'warmbank', lng: 'en', dark: null } },
        { search: '?fi=coolbank&lng=en&dark=1', expected: { fi: 'coolbank', lng: 'en', dark: '1' } },
      ]
      
      changes.forEach(change => {
        act(() => {
          mockLocation.search = change.search
          window.history.replaceState({}, '', `http://localhost:3000${change.search}`)
        })
        
        expect(result.current).toEqual(change.expected)
      })
    })
  })

  describe('Cache Key Generation', () => {
    it('creates correct cache keys', () => {
      expect(createCacheKey(null, 'en')).toBe('default-en')
      expect(createCacheKey('warmbank', 'en')).toBe('warmbank-en')
      expect(createCacheKey('warmbank', 'es')).toBe('warmbank-es')
      expect(createCacheKey('coolbank', 'es')).toBe('coolbank-es')
    })

    it('handles empty/null values correctly', () => {
      expect(createCacheKey('', 'en')).toBe('default-en')
      expect(createCacheKey(null, '')).toBe('default-')
    })
  })

  describe('useConfigCacheKey Hook', () => {
    it('returns correct cache key for current URL parameters', () => {
      mockLocation.search = '?fi=warmbank&lng=es'
      
      const { result } = renderHook(() => useConfigCacheKey())
      
      expect(result.current).toBe('warmbank-es')
    })

    it('updates cache key when URL parameters change', () => {
      mockLocation.search = '?fi=warmbank&lng=en'
      
      const { result } = renderHook(() => useConfigCacheKey())
      
      expect(result.current).toBe('warmbank-en')
      
      act(() => {
        mockLocation.search = '?fi=warmbank&lng=es'
        window.history.replaceState({}, '', 'http://localhost:3000?fi=warmbank&lng=es')
      })
      
      expect(result.current).toBe('warmbank-es')
    })

    it('handles default values correctly', () => {
      mockLocation.search = ''
      
      const { result } = renderHook(() => useConfigCacheKey())
      
      expect(result.current).toBe('default-en')
    })
  })

  describe('Performance and Memory', () => {
    it('cleans up event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      
      const { unmount } = renderHook(() => useUrlParams())
      
      unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function))
    })

    it('restores original history methods on unmount', () => {
      const originalPushState = window.history.pushState
      const originalReplaceState = window.history.replaceState
      
      const { unmount } = renderHook(() => useUrlParams())
      
      // History methods should be wrapped
      expect(window.history.pushState).not.toBe(originalPushState)
      expect(window.history.replaceState).not.toBe(originalReplaceState)
      
      unmount()
      
      // History methods should be restored
      expect(window.history.pushState).toBe(originalPushState)
      expect(window.history.replaceState).toBe(originalReplaceState)
    })
  })

  describe('Edge Cases', () => {
    it('handles malformed URL parameters gracefully', () => {
      mockLocation.search = '?fi=&lng=invalid&dark'

      const {result} = renderHook(() => useUrlParams())

      expect(result.current).toEqual({
        fi: '',
        lng: 'invalid', // Invalid languages are preserved
        dark: ''
      })
    })

    it('handles URL encoding correctly', () => {
      mockLocation.search = '?fi=test%20bank&lng=es'

      const {result} = renderHook(() => useUrlParams())

      expect(result.current.fi).toBe('test bank')
    })
  })
})