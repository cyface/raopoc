import { describe, it, expect } from 'vitest'
import { CustomerInfoSchema, AddressSchema } from './customer'

describe('Customer Validation', () => {
  describe('AddressSchema', () => {
    it('validates a correct address', () => {
      const validAddress = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }
      
      expect(() => AddressSchema.parse(validAddress)).not.toThrow()
    })

    it('validates ZIP+4 format', () => {
      const validAddress = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345-6789'
      }
      
      expect(() => AddressSchema.parse(validAddress)).not.toThrow()
    })

    it('rejects invalid ZIP codes', () => {
      const invalidAddress = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '123'
      }
      
      expect(() => AddressSchema.parse(invalidAddress)).toThrow('Invalid ZIP code format')
    })

    it('rejects invalid state codes', () => {
      const invalidAddress = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'California',
        zipCode: '12345'
      }
      
      expect(() => AddressSchema.parse(invalidAddress)).toThrow('State must be 2 characters')
    })
  })

  describe('CustomerInfoSchema Email Validation', () => {
    const baseCustomerInfo = {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '(555) 123-4567',
      mailingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      },
      useSameAddress: true
    }

    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
        'a@b.co'
      ]

      validEmails.forEach(email => {
        const customerInfo = { ...baseCustomerInfo, email }
        expect(() => CustomerInfoSchema.parse(customerInfo)).not.toThrow()
      })
    })

    it('rejects empty email', () => {
      const customerInfo = { ...baseCustomerInfo, email: '' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Email address is required')
    })

    it('rejects email without @ symbol', () => {
      const customerInfo = { ...baseCustomerInfo, email: 'testexample.com' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Please enter a valid email address')
    })

    it('rejects email with multiple @ symbols', () => {
      const customerInfo = { ...baseCustomerInfo, email: 'test@example@com' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Email must contain exactly one @ symbol')
    })

    it('rejects email without domain extension', () => {
      const customerInfo = { ...baseCustomerInfo, email: 'test@example' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Please enter a valid email address')
    })

    it('rejects email with consecutive dots', () => {
      const customerInfo = { ...baseCustomerInfo, email: 'test..user@example.com' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Email cannot contain consecutive dots')
    })

    it('rejects email starting with dot', () => {
      const customerInfo = { ...baseCustomerInfo, email: '.test@example.com' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Email cannot start or end with a dot')
    })

    it('rejects email ending with dot', () => {
      const customerInfo = { ...baseCustomerInfo, email: 'test@example.com.' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Email cannot start or end with a dot')
    })

    it('rejects email with too long local part', () => {
      const longLocalPart = 'a'.repeat(65) + '@example.com'
      const customerInfo = { ...baseCustomerInfo, email: longLocalPart }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Email address is too long')
    })

    it('rejects email with too long domain', () => {
      const longDomain = 'test@' + 'a'.repeat(250) + '.com'
      const customerInfo = { ...baseCustomerInfo, email: longDomain }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Email address is too long')
    })

    it('rejects email with invalid characters', () => {
      const customerInfo = { ...baseCustomerInfo, email: 'test@exam ple.com' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Please enter a valid email address')
    })

    it('rejects email with short domain extension', () => {
      const customerInfo = { ...baseCustomerInfo, email: 'test@example.c' }
      expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Please enter a valid email address')
    })
  })

  describe('CustomerInfoSchema Phone Validation', () => {
    const baseCustomerInfo = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      mailingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      },
      useSameAddress: true
    }

    it('validates correct phone number formats', () => {
      const validPhones = [
        '(555) 123-4567',
        '555-123-4567',
        '555.123.4567',
        '555 123 4567',
        '5551234567'
      ]

      validPhones.forEach(phoneNumber => {
        const customerInfo = { ...baseCustomerInfo, phoneNumber }
        expect(() => CustomerInfoSchema.parse(customerInfo)).not.toThrow()
      })
    })

    it('rejects invalid phone number formats', () => {
      const invalidPhones = [
        '123-456',
        '(555) 123-456',
        '555-123-45678',
        'abc-def-ghij',
        '555-123-'
      ]

      invalidPhones.forEach(phoneNumber => {
        const customerInfo = { ...baseCustomerInfo, phoneNumber }
        expect(() => CustomerInfoSchema.parse(customerInfo)).toThrow('Invalid phone number format')
      })
    })
  })
})