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