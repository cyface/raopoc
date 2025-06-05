import { useState, useEffect, useCallback } from 'react'

interface UrlParams {
  fi: string | null
  lng: string
  dark: string | null
}

/**
 * Hook to watch URL parameters and provide reactive updates
 * Returns current URL parameters and updates when they change
 */
export function useUrlParams(): UrlParams {
  const [params, setParams] = useState<UrlParams>(() => getCurrentParams())

  function getCurrentParams(): UrlParams {
    if (typeof window === 'undefined') {
      return { fi: null, lng: 'en', dark: null }
    }

    const urlParams = new URLSearchParams(window.location.search)
    const fi = urlParams.get('fi')
    const lng = urlParams.get('lng') || 'en'
    const dark = urlParams.get('dark')

    return { fi, lng, dark }
  }

  const updateParams = useCallback(() => {
    setParams(getCurrentParams())
  }, [])

  useEffect(() => {
    // Listen for URL changes (back/forward, manual URL changes)
    const handlePopState = () => {
      updateParams()
    }

    window.addEventListener('popstate', handlePopState)
    
    // Also listen for pushstate/replacestate (programmatic URL changes)
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args)
      updateParams()
    }

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args)
      updateParams()
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [updateParams])

  return params
}

/**
 * Create a cache key from URL parameters
 */
export function createCacheKey(fi: string | null, lng: string): string {
  const bank = fi || 'default'
  return `${bank}-${lng}`
}

/**
 * Hook that returns the current cache key for config lookups
 */
export function useConfigCacheKey(): string {
  const { fi, lng } = useUrlParams()
  return createCacheKey(fi, lng)
}