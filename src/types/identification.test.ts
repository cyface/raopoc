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
      country: 'US',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: '1990-01-01',
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
      dateOfBirth: '1990-01-01',
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
      dateOfBirth: '1990-01-01',
    }
    
    expect(() => IdentificationInfoSchema.parse(validData)).not.toThrow()
  })

  it('accepts data without SSN when noSSN is true', () => {
    const validData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      country: 'US',
      noSSN: true,
      dateOfBirth: '1990-01-01',
    }
    
    expect(() => IdentificationInfoSchema.parse(validData)).not.toThrow()
  })

  it('requires identification number', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: '',
      country: 'US',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: '1990-01-01',
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('Identification number is required')
  })

  it('requires state for drivers license', () => {
    const invalidData = {
      identificationType: 'drivers-license' as const,
      identificationNumber: 'D1234567',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: '1990-01-01',
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('State is required for this identification type')
  })

  it('requires state for state ID', () => {
    const invalidData = {
      identificationType: 'state-id' as const,
      identificationNumber: 'S1234567',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: '1990-01-01',
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('State is required for this identification type')
  })

  it('requires SSN when noSSN is false', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      country: 'US',
      noSSN: false,
      dateOfBirth: '1990-01-01',
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('Social Security Number is required')
  })

  it('validates SSN format', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      country: 'US',
      socialSecurityNumber: '123-45-678', // Invalid format
      noSSN: false,
      dateOfBirth: '1990-01-01',
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
        country: 'US',
        socialSecurityNumber: ssn,
        noSSN: false,
        dateOfBirth: '1990-01-01',
      }
      
      expect(() => IdentificationInfoSchema.parse(validData)).not.toThrow()
    })
  })

  it('does not require state for passport and military ID types', () => {
    const validData1 = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      country: 'US',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: '1990-01-01',
    }
    
    const validData2 = {
      identificationType: 'military-id' as const,
      identificationNumber: 'M12345678',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: '1990-01-01',
    }
    
    expect(() => IdentificationInfoSchema.parse(validData1)).not.toThrow()
    expect(() => IdentificationInfoSchema.parse(validData2)).not.toThrow()
  })

  it('requires date of birth', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      country: 'US',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: '',
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('Date of birth is required')
  })

  it('validates minimum age requirement (18 years old)', () => {
    const today = new Date()
    const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate()).toISOString().split('T')[0]
    
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      country: 'US',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: underageDate,
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('You must be at least 18 years old')
  })

  it('validates maximum age (not over 120 years old)', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      country: 'US',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: '1800-01-01',
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('Please enter a valid date of birth')
  })

  it('validates date format', () => {
    const invalidData = {
      identificationType: 'passport' as const,
      identificationNumber: 'A12345678',
      country: 'US',
      socialSecurityNumber: '123-45-6789',
      noSSN: false,
      dateOfBirth: 'invalid-date',
    }
    
    expect(() => IdentificationInfoSchema.parse(invalidData)).toThrow('Invalid date format')
  })
})