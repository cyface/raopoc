/**
 * Dynamically determines the API URL based on the current hostname
 * 
 * This function provides automatic API URL detection:
 * - If API_URL is set in environment, use it (for explicit overrides)
 * - If running on https://app.localhost (Caddy proxy), use https://app.localhost/api
 * - If running on localhost:5173 (Vite dev server), use http://localhost:3000/api
 * - Otherwise, construct URL based on current protocol/hostname
 */
export function getApiUrl(): string {
  // If API_URL is explicitly set in environment, use it
  if (import.meta.env.API_URL) {
    return import.meta.env.API_URL;
  }

  // Check if we're in a browser environment
  if (typeof window === 'undefined' || !window.location) {
    return 'http://localhost:3000/api'; // Default for SSR/build time/tests
  }

  const { hostname, protocol, port } = window.location;

  // Handle case where location properties are undefined (test environment)
  if (!hostname || !protocol) {
    return 'http://localhost:3000/api'; // Default for test environment
  }

  // Running on https://app.localhost (through Caddy)
  if (hostname === 'app.localhost') {
    return 'https://app.localhost/api';
  }

  // Running on localhost with standard Vite port
  if (hostname === 'localhost' && port === '5173') {
    return 'http://localhost:3000/api';
  }

  // Default fallback - construct URL based on current location
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
}