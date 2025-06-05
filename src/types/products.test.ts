import { describe, it, expect } from 'vitest'
import { ProductType, ProductSelectionSchema } from './products'

describe('Product Types and Validation', () => {
  describe('ProductType', () => {
    it('validates correct product types', () => {
      expect(ProductType.parse('checking')).toBe('checking')
      expect(ProductType.parse('savings')).toBe('savings')
      expect(ProductType.parse('money-market')).toBe('money-market')
    })

    it('rejects invalid product types', () => {
      expect(() => ProductType.parse('invalid')).toThrow()
      expect(() => ProductType.parse('credit')).toThrow()
    })
  })

  describe('ProductSelectionSchema', () => {
    it('validates valid product selections', () => {
      const validData = {
        selectedProducts: ['checking', 'savings'] as const
      }
      
      expect(() => ProductSelectionSchema.parse(validData)).not.toThrow()
    })

    it('rejects empty product selections', () => {
      const invalidData = {
        selectedProducts: []
      }
      
      expect(() => ProductSelectionSchema.parse(invalidData)).toThrow('Please select at least one product')
    })

    it('validates single product selection', () => {
      const validData = {
        selectedProducts: ['money-market'] as const
      }
      
      expect(() => ProductSelectionSchema.parse(validData)).not.toThrow()
    })

    it('rejects invalid product types in selection', () => {
      const invalidData = {
        selectedProducts: ['checking', 'invalid' as const] as string[]
      }
      
      expect(() => ProductSelectionSchema.parse(invalidData)).toThrow()
    })
  })
})