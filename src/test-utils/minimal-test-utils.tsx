import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

/**
 * Minimal test wrapper for testing components without React Router
 */
export function renderMinimal(
  ui: ReactElement,
  options?: RenderOptions
) {
  // Create a minimal wrapper that just renders the component
  // without complex providers that might fail in tests
  function MinimalWrapper({ children }: { children: React.ReactNode }) {
    return <div data-testid="test-wrapper">{children}</div>
  }
  
  return render(ui, { wrapper: MinimalWrapper, ...options })
}

/**
 * Mock data for testing
 */
export const mockTestData = {
  states: [
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' },
    { code: 'TX', name: 'Texas' }
  ],
  bankInfo: {
    bankName: 'Test Bank',
    displayName: 'Test Bank',
    contact: { 
      phone: '1-800-TEST', 
      phoneDisplay: '1-800-TEST', 
      email: 'test@bank.com', 
      hours: '9 AM - 5 PM' 
    },
    branding: { 
      primaryColor: '#0066cc', 
      logoIcon: '🏦' 
    }
  },
  products: [
    {
      type: 'checking',
      title: 'Checking Account',
      description: 'Everyday banking with easy access to your money',
      icon: '💳'
    },
    {
      type: 'savings',
      title: 'Savings Account', 
      description: 'Grow your money with competitive interest rates',
      icon: '💰'
    }
  ]
}