import { z } from 'zod'

// NOTE: This enum should match the product types defined in config/products.json
export const ProductType = z.enum(['checking', 'savings', 'money-market'])

export type ProductType = z.infer<typeof ProductType>

export const ProductSelectionSchema = z.object({
  selectedProducts: z.array(ProductType).min(1, 'Please select at least one product')
})

export type ProductSelectionData = z.infer<typeof ProductSelectionSchema>