import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DevStepNavigator } from '../DevStepNavigator'

// Mock the useUrlParams hook
vi.mock('../../hooks/useUrlParams', () => ({
  useUrlParams: vi.fn()
}))

// Mock React Router navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/', search: '?devStep=3&mockScenario=noSSN&fi=testbank' })
  }
})

import { useUrlParams } from '../../hooks/useUrlParams'

describe('DevStepNavigator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('navigates to step 3 when devStep=3', () => {
    vi.mocked(useUrlParams).mockReturnValue({
      devStep: 3,
      mockScenario: null,
      fi: 'default',
      lng: 'en',
      dark: null
    })

    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <DevStepNavigator />
      </MemoryRouter>
    )

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/step/3/customer-info',
      search: '?devStep=3&mockScenario=noSSN&fi=testbank'
    }, { replace: true })
  })

  it('does not navigate when devStep is not present', () => {
    vi.mocked(useUrlParams).mockReturnValue({
      devStep: null,
      mockScenario: null,
      fi: 'default',
      lng: 'en',
      dark: null
    })

    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <DevStepNavigator />
      </MemoryRouter>
    )

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('navigates to step 2 when devStep=2', () => {
    vi.mocked(useUrlParams).mockReturnValue({
      devStep: 2,
      mockScenario: null,
      fi: 'default',
      lng: 'en',
      dark: null
    })

    render(
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <DevStepNavigator />
      </MemoryRouter>
    )

    expect(mockNavigate).toHaveBeenCalledWith({
      pathname: '/step/2/product-selection',
      search: '?devStep=3&mockScenario=noSSN&fi=testbank'
    }, { replace: true })
  })
})