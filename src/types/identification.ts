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
  socialSecurityNumber: z.string().optional(),
  noSSN: z.boolean().default(false),
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