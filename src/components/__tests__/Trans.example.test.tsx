import { render, screen } from '@testing-library/react'
import { Trans } from 'react-i18next'
import { describe, it, expect } from 'vitest'

interface MockTransProps {
  i18nKey: string
  values?: Record<string, string>
  components?: Record<string, React.ReactElement>
}

// Mock i18next
vi.mock('react-i18next', () => ({
  Trans: ({ i18nKey, values, components }: MockTransProps) => {
    // Simulate how Trans component works with HTML tags
    if (i18nKey === 'confirmationScreen.success.emailMessage') {
      const text = `A confirmation email has been sent to <strong>${values?.email || 'user@example.com'}</strong> with your application details.`
      
      // Simple HTML replacement for testing
      const parts = text.split(/<strong>(.*?)<\/strong>/)
      return (
        <>
          {parts[0]}
          {components?.strong && React.cloneElement(components.strong, {}, parts[1])}
          {parts[2]}
        </>
      )
    }
    return null
  }
}))

import React from 'react'

describe('Trans Component Example', () => {
  it('renders HTML content safely with proper styling', () => {
    render(
      <div data-testid="email-message">
        <Trans
          i18nKey="confirmationScreen.success.emailMessage"
          values={{ email: 'john.doe@example.com' }}
          components={{
            strong: <strong style={{ color: '#007bff' }} />
          }}
        />
      </div>
    )

    const messageElement = screen.getByTestId('email-message')
    expect(messageElement).toBeInTheDocument()
    
    // Check that the email is rendered as a strong element
    const strongElement = messageElement.querySelector('strong')
    expect(strongElement).toBeInTheDocument()
    expect(strongElement).toHaveTextContent('john.doe@example.com')
    expect(strongElement).toHaveStyle({ color: '#007bff' })
  })
})