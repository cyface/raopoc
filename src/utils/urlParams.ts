/**
 * Utility functions for URL parameter handling
 */

/**
 * Get the financial institution slug from URL parameters
 * @returns The 'fi' parameter value or null if not present
 */
export function getFinancialInstitutionSlug(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('fi')
}

/**
 * Check if dark mode is requested via URL parameter
 * @returns True if 'dark=1' parameter is present
 */
export function isDarkModeRequested(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('dark') === '1'
}

/**
 * Get all URL parameters as an object
 */
export function getUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  const params: Record<string, string> = {}
  
  for (const [key, value] of urlParams.entries()) {
    params[key] = value
  }
  
  return params
}

/**
 * Extract search parameters from URLSearchParams
 */
export function getSearchParams(searchParams: URLSearchParams) {
  const fi = searchParams.get('fi')
  const lng = searchParams.get('lng') || 'en'
  const dark = searchParams.get('dark')
  
  return { fi, lng, dark }
}

/**
 * Build URL search params string from parameters
 */
export function buildSearchParams(params: {
  fi?: string | null
  lng?: string
  dark?: string | null
}): string {
  const searchParams = new URLSearchParams()
  
  if (params.fi) searchParams.set('fi', params.fi)
  if (params.lng && params.lng !== 'en') searchParams.set('lng', params.lng)
  if (params.dark) searchParams.set('dark', params.dark)
  
  const paramString = searchParams.toString()
  return paramString ? `?${paramString}` : ''
}

/**
 * Merge new params with existing search params
 */
export function mergeSearchParams(
  currentParams: URLSearchParams,
  newParams: Partial<{ fi: string | null; lng: string; dark: string | null }>
): string {
  const current = getSearchParams(currentParams)
  const merged = { ...current, ...newParams }
  return buildSearchParams(merged)
}