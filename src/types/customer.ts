import { z } from 'zod'

export const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
})

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const CustomerInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string()
    .min(1, 'Email address is required')
    .refine((email) => {
      if (!email.includes('@')) return false
      return emailRegex.test(email)
    }, 'Please enter a valid email address (e.g., name@example.com)')
    .refine((email) => !email.includes('..'), 'Email cannot contain consecutive dots')
    .refine((email) => !email.startsWith('.') && !email.endsWith('.'), 'Email cannot start or end with a dot')
    .refine((email) => {
      const parts = email.split('@')
      return parts.length === 2
    }, 'Email must contain exactly one @ symbol')
    .refine((email) => {
      const parts = email.split('@')
      if (parts.length !== 2) return true // Let the previous validation handle this
      const [localPart, domain] = parts
      return localPart && domain && localPart.length <= 64 && domain.length <= 253
    }, 'Email address is too long'),
  phoneNumber: z.string().regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, 'Invalid phone number format'),
  mailingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  useSameAddress: z.boolean().default(true),
})

export type AddressData = z.infer<typeof AddressSchema>
export type CustomerInfoData = z.infer<typeof CustomerInfoSchema>

export const OnboardingDataSchema = z.object({
  selectedProducts: z.array(z.enum(['checking', 'savings', 'money-market'])).min(1),
  customerInfo: CustomerInfoSchema.optional(),
  identificationInfo: z.any().optional(), // Will import proper type later
  documentAcceptance: z.any().optional(), // Will import proper type later
})

export type OnboardingData = z.infer<typeof OnboardingDataSchema>