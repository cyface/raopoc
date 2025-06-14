import { IsNotEmpty, IsOptional, IsString, IsObject, IsArray, IsEnum } from 'class-validator'

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsArray()
  @IsEnum(['checking', 'savings', 'money-market'], { each: true })
  selectedProducts: ('checking' | 'savings' | 'money-market')[]

  @IsNotEmpty()
  @IsObject()
  customerInfo: {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    mailingAddress: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    billingAddress?: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    useSameAddress: boolean
  }

  @IsOptional()
  @IsObject()
  identificationInfo?: {
    identificationType: string
    identificationNumber: string
    state?: string
    country?: string
    socialSecurityNumber?: string
    noSSN: boolean
    dateOfBirth: string
  }

  @IsOptional()
  @IsObject()
  documentAcceptance?: {
    acceptances: Record<string, {
      documentId: string
      accepted: boolean
      acceptedAt?: string
    }>
    allAccepted: boolean
  }

  @IsOptional()
  @IsObject()
  metadata?: {
    userAgent?: string
    ipAddress?: string
    timestamp?: string
    [key: string]: unknown
  }
}

export class CreditCheckDto {
  @IsNotEmpty()
  @IsString()
  ssn: string
}