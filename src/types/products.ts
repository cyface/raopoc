import { z } from 'zod'

export const ProductType = z.enum(['checking', 'savings', 'money-market'])

export type ProductType = z.infer<typeof ProductType>

export const ProductSelectionSchema = z.object({
  selectedProducts: z.array(ProductType).min(1, 'Please select at least one product')
})

export type ProductSelectionData = z.infer<typeof ProductSelectionSchema>