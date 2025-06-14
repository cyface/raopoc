import { describe, it, expect } from 'vitest'
import { populateMockDataUpToStep, MOCK_SCENARIOS } from './mockData'

describe('populateMockDataUpToStep', () => {
  it('should populate data up to step 1', () => {
    const mockData = populateMockDataUpToStep(1)
    
    expect(mockData.selectedProducts).toEqual(['checking', 'savings'])
    expect(mockData.customerInfo).toBeUndefined()
    expect(mockData.identificationInfo).toBeUndefined()
    expect(mockData.documentAcceptance).toBeUndefined()
  })

  it('should populate data up to step 2', () => {
    const mockData = populateMockDataUpToStep(2)
    
    expect(mockData.selectedProducts).toEqual(['checking', 'savings'])
    expect(mockData.customerInfo).toBeDefined()
    expect(mockData.customerInfo?.firstName).toBe('John')
    expect(mockData.customerInfo?.lastName).toBe('Doe')
    expect(mockData.identificationInfo).toBeUndefined()
    expect(mockData.documentAcceptance).toBeUndefined()
  })

  it('should populate data up to step 3', () => {
    const mockData = populateMockDataUpToStep(3)
    
    expect(mockData.selectedProducts).toEqual(['checking', 'savings'])
    expect(mockData.customerInfo).toBeDefined()
    expect(mockData.identificationInfo).toBeDefined()
    expect(mockData.identificationInfo?.identificationType).toBe('drivers-license')
    expect(mockData.documentAcceptance).toBeUndefined()
  })

  it('should populate data up to step 4', () => {
    const mockData = populateMockDataUpToStep(4)
    
    expect(mockData.selectedProducts).toEqual(['checking', 'savings'])
    expect(mockData.customerInfo).toBeDefined()
    expect(mockData.identificationInfo).toBeDefined()
    expect(mockData.documentAcceptance).toBeDefined()
    expect(mockData.documentAcceptance?.allAccepted).toBe(true)
  })

  it('should populate data up to step 5', () => {
    const mockData = populateMockDataUpToStep(5)
    
    expect(mockData.selectedProducts).toEqual(['checking', 'savings'])
    expect(mockData.customerInfo).toBeDefined()
    expect(mockData.identificationInfo).toBeDefined()
    expect(mockData.documentAcceptance).toBeDefined()
  })

  it('should use passport for passport scenario', () => {
    const config = MOCK_SCENARIOS.passport.config
    const mockData = populateMockDataUpToStep(3, config)
    
    expect(mockData.identificationInfo?.identificationType).toBe('passport')
    expect(mockData.identificationInfo?.country).toBe('United States')
  })

  it('should use no SSN for noSSN scenario', () => {
    const config = MOCK_SCENARIOS.noSSN.config
    const mockData = populateMockDataUpToStep(3, config)
    
    expect(mockData.identificationInfo?.noSSN).toBe(true)
    expect(mockData.identificationInfo?.socialSecurityNumber).toBeUndefined()
  })

  it('should use different billing address when configured', () => {
    const config = MOCK_SCENARIOS.differentBilling.config
    const mockData = populateMockDataUpToStep(2, config)
    
    expect(mockData.customerInfo?.useSameAddress).toBe(false)
    expect(mockData.customerInfo?.billingAddress).toBeDefined()
    expect(mockData.customerInfo?.billingAddress?.street).toBe('456 Business Ave')
  })

  it('should use money market products when configured', () => {
    const config = MOCK_SCENARIOS.moneyMarket.config
    const mockData = populateMockDataUpToStep(1, config)
    
    expect(mockData.selectedProducts).toEqual(['checking', 'money-market'])
  })

  it('should use savings only when configured', () => {
    const config = MOCK_SCENARIOS.savingsOnly.config
    const mockData = populateMockDataUpToStep(1, config)
    
    expect(mockData.selectedProducts).toEqual(['savings'])
  })
})