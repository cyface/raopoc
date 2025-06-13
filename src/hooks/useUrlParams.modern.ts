import { useSearchParams } from 'react-router'
import { useMemo } from 'react'

interface UrlParams {
  fi: string | null
  lng: string
  dark: string | null
}

/**
 * Modern hook using React Router's useSearchParams
 * Provides reactive updates when URL parameters change
 */
export function useUrlParams(): UrlParams {
  const [searchParams] = useSearchParams()
  
  return useMemo(() => ({
    fi: searchParams.get('fi'),
    lng: searchParams.get('lng') || 'en',
    dark: searchParams.get('dark'),
  }), [searchParams])
}

/**
 * Hook that returns the current cache key for config lookups
 */
export function useConfigCacheKey(): string {
  const { fi, lng } = useUrlParams()
  return createCacheKey(fi, lng)
}

/**
 * Create a cache key from URL parameters
 */
export function createCacheKey(fi: string | null, lng: string): string {
  const bank = fi || 'default'
  return `${bank}-${lng}`
}

/**
 * Hook to update URL parameters
 */
export function useUpdateUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  return (updates: Partial<UrlParams>) => {
    const newParams = new URLSearchParams(searchParams)
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        newParams.delete(key)
      } else {
        newParams.set(key, value)
      }
    })
    
    setSearchParams(newParams, { replace: true })
  }
}