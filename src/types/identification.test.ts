import { describe, it, expect } from 'vitest'
import { IdentificationInfoSchema, IdentificationTypeSchema } from './identification'

describe('IdentificationTypeSchema', () => {
  it('accepts valid identification types', () => {
    expect(() => IdentificationTypeSchema.parse('passport')).not.toThrow()
    expect(() => IdentificationTypeSchema.parse('drivers-license')).not.toThrow()
    expect(() => IdentificationTypeSchema.parse('state-id')).not.toThrow()
    expect(() => IdentificationTypeSchema.parse('military-id')).not.toThrow()
  })

  it('rejects invalid identification types', () => {
    expect(() => IdentificationTypeSchema.parse('invalid-type')).toThrow()
    expect(() => IdentificationTypeSchema.parse('')).toThrow()
  })
})

describe('IdentificationInfoSchema', () => {
  it('accepts valid identification data with passport', () => {
    const validData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(validData)).not.toThrow()
  })

  it('accepts valid identification data with drivers license and state', () => {
    const validData = {
      identificationType: 'drivers-license' as const,
      identificationNumber: 'D1234567',
      state: 'CA',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(validData)).not.toThrow()
  })

  it('accepts valid identification data with state ID and state', () => {
    const validData = {
      identificationType: 'state-id' as const,
      identificationNumber: 'S1234567',
      state: 'NY',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(validData)).not.toThrow()
  })

  it('accepts data without SSN when noSSN is true', () => {
    const validData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      noSSN: true,
    }
    
    expect(() => IdentificationInfoSchema.parse(validData)).not.toThrow()
  })

  it('requires identification number', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: '',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('Identification number is required')
  })

  it('requires state for drivers license', () => {
    const invalidData = {
      identificationType: 'drivers-license' as const,
      identificationNumber: 'D1234567',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('State is required for this identification type')
  })

  it('requires state for state ID', () => {
    const invalidData = {
      identificationType: 'state-id' as const,
      identificationNumber: 'S1234567',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('State is required for this identification type')
  })

  it('requires SSN when noSSN is false', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('Social Security Number is required')
  })

  it('validates SSN format', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      socialSecurityNumber: '123-45-678', // Invalid format
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('Invalid Social Security Number format')
  })

  it('accepts valid SSN formats', () => {
    const testCases = [
      '123-45-6789',
      '123456789',
    ]

    testCases.forEach(ssn => {
      const validData = {
        identificationType: 'passport' as const,
        identificationNumber: 'A12345678',
        socialSecurityNumber: ssn,
        noSSN: false,
      }
      
      expect(() => IdentificationInfoSchema.parse(validData)).not.toThrow()
    })
  })

  it('does not require state for passport and military ID types', () => {
    const validData1 = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
    }
    
    const validData2 = {
      identificationType: 'military-id' as const,
      identificationNumber: 'M12345678',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
    }
    
    expect(() => IdentificationInfoSchema.parse(validData1)).not.toThrow()
    expect(() => IdentificationInfoSchema.parse(validData2)).not.toThrow()
  })
})