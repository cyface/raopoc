import { z } from 'zod'

export const IdentificationTypeSchema = z.enum([
  'passport',
  'drivers-license',
  'state-id',
  'military-id',
])

export type IdentificationType = z.infer<typeof IdentificationTypeSchema>

export const IdentificationInfoSchema = z.object({
  identificationType: IdentificationTypeSchema,
  identificationNumber: z.string().min(1, 'Identification number is required'),
  state: z.string().optional(),
  country: z.string().optional(),
  socialSecurityNumber: z.string().optional(),
  noSSN: z.boolean().default(false),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const parsedDate = new Date(date)
      return !isNaN(parsedDate.getTime())
    }, 'Invalid date format')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      const dayDiff = today.getDate() - birthDate.getDate()
      
      // Check if birthday hasn't occurred this year
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age
      
      return actualAge >= 18
    }, 'You must be at least 18 years old')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      
      return age <= 120
    }, 'Please enter a valid date of birth'),
}).refine((data) => {
  // State is required for driver's license and state-id
  if ((data.identificationType === 'drivers-license' || data.identificationType === 'state-id') && !data.state) {
    return false
  }
  return true
}, {
  message: 'State is required for this identification type',
  path: ['state'],
}).refine((data) => {
  // Country is required for passport
  if (data.identificationType === 'passport' && !data.country) {
    return false
  }
  return true
}, {
  message: 'Country is required for passport',
  path: ['country'],
}).refine((data) => {
  // SSN is required unless noSSN is checked
  if (!data.noSSN && !data.socialSecurityNumber) {
    return false
  }
  return true
}, {
  message: 'Social Security Number is required',
  path: ['socialSecurityNumber'],
}).refine((data) => {
  // Validate SSN format if provided
  if (data.socialSecurityNumber && data.socialSecurityNumber.length > 0) {
    const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/
    if (!ssnRegex.test(data.socialSecurityNumber.replace(/\D/g, '').replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3'))) {
      return false
    }
  }
  return true
}, {
  message: 'Invalid Social Security Number format',
  path: ['socialSecurityNumber'],
})

export type IdentificationInfoData = z.infer<typeof IdentificationInfoSchema>

// IDENTIFICATION_TYPES moved to config/identification-types.json and loaded via configService