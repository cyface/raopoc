import { useUrlParams } from '../hooks/useUrlParams'
import { MOCK_SCENARIOS } from '../utils/mockData'

export function DevHelper() {
  const { devStep, mockScenario } = useUrlParams()

  // Only show in development mode when devStep is present
  if (!devStep) {
    return null
  }

  const currentUrl = new URL(window.location.href)
  
  const createStepUrl = (step: number, scenario?: string) => {
    const newUrl = new URL(currentUrl)
    newUrl.searchParams.set('devStep', step.toString())
    if (scenario) {
      newUrl.searchParams.set('mockScenario', scenario)
    } else {
      newUrl.searchParams.delete('mockScenario')
    }
    return newUrl.toString()
  }

  const createScenarioUrl = (scenario: string) => {
    const newUrl = new URL(currentUrl)
    newUrl.searchParams.set('mockScenario', scenario)
    return newUrl.toString()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      backgroundColor: '#1a1a1a',
      color: '#fff',
      padding: '1rem',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      zIndex: 1000,
      maxWidth: '300px',
      borderLeft: '3px solid #fbbf24'
    }}>
      <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
        🔧 Dev Mode: Step {devStep}
        {mockScenario && <div>Scenario: {mockScenario}</div>}
      </div>
      
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Steps:</strong>
        <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
          {[1, 2, 3, 4, 5].map(step => (
            <a
              key={step}
              href={createStepUrl(step, mockScenario || undefined)}
              style={{
                padding: '2px 6px',
                backgroundColor: step === devStep ? '#fbbf24' : '#374151',
                color: step === devStep ? '#000' : '#fff',
                textDecoration: 'none',
                borderRadius: '2px',
                fontSize: '0.7rem'
              }}
            >
              {step}
            </a>
          ))}
        </div>
      </div>

      <div>
        <strong>Scenarios:</strong>
        <div style={{ marginTop: '2px' }}>
          <a
            href={createStepUrl(devStep)}
            style={{
              display: 'block',
              padding: '1px 4px',
              backgroundColor: !mockScenario ? '#fbbf24' : 'transparent',
              color: !mockScenario ? '#000' : '#9ca3af',
              textDecoration: 'none',
              fontSize: '0.7rem',
              marginBottom: '1px'
            }}
          >
            Default
          </a>
          {Object.entries(MOCK_SCENARIOS).map(([key, scenario]) => (
            <a
              key={key}
              href={createScenarioUrl(key)}
              style={{
                display: 'block',
                padding: '1px 4px',
                backgroundColor: mockScenario === key ? '#fbbf24' : 'transparent',
                color: mockScenario === key ? '#000' : '#9ca3af',
                textDecoration: 'none',
                fontSize: '0.7rem',
                marginBottom: '1px'
              }}
            >
              {scenario.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}