import { Field, ObjectType, ID, registerEnumType } from '@nestjs/graphql'
import { LeadStatus, ProductType, CreditStatus } from '@prisma/client'

// Register Prisma enums with GraphQL
registerEnumType(LeadStatus, {
  name: 'LeadStatus',
  description: 'The status of a lead in the onboarding process'
})

registerEnumType(ProductType, {
  name: 'ProductType',
  description: 'Available bank product types'
})

registerEnumType(CreditStatus, {
  name: 'CreditStatus',
  description: 'Credit check status'
})

@ObjectType()
export class Address {
  @Field()
  street: string = ''

  @Field()
  city: string = ''

  @Field()
  state: string = ''

  @Field()
  zipCode: string = ''
}

@ObjectType()
export class CustomerInfo {
  @Field()
  firstName: string = ''

  @Field()
  lastName: string = ''

  @Field()
  email: string = ''

  @Field()
  phoneNumber: string = ''

  @Field(() => Address)
  mailingAddress: Address = new Address()

  @Field(() => Address, { nullable: true })
  billingAddress?: Address

  @Field()
  useSameAddress: boolean = false
}

@ObjectType()
export class IdentificationInfo {
  @Field()
  identificationType: string = ''

  @Field()
  identificationNumber: string = ''

  @Field({ nullable: true })
  state?: string

  @Field({ nullable: true })
  country?: string

  @Field({ nullable: true })
  socialSecurityNumber?: string

  @Field()
  noSSN: boolean = false

  @Field()
  dateOfBirth: string = ''
}

@ObjectType()
export class DocumentAcceptance {
  @Field(() => ID)
  id: string = ''

  @Field()
  leadId: string = ''

  @Field()
  documentId: string = ''

  @Field()
  accepted: boolean = false

  @Field({ nullable: true })
  acceptedAt?: Date
}

@ObjectType()
export class Lead {
  @Field(() => ID)
  id: string = ''

  @Field(() => LeadStatus)
  status: LeadStatus = LeadStatus.DRAFT

  @Field()
  currentStep: number = 0

  @Field(() => [Number])
  completedSteps: number[] = []

  @Field(() => [ProductType])
  selectedProducts: ProductType[] = []

  @Field(() => CustomerInfo, { nullable: true })
  customerInfo?: CustomerInfo

  @Field(() => IdentificationInfo, { nullable: true })
  identificationInfo?: IdentificationInfo

  @Field({ nullable: true })
  financialInstitution?: string

  @Field()
  language: string = ''

  @Field({ nullable: true })
  theme?: string

  @Field(() => CreditStatus, { nullable: true })
  creditCheckStatus?: CreditStatus

  @Field({ nullable: true })
  requiresVerification?: boolean

  @Field({ nullable: true })
  creditCheckMessage?: string

  @Field({ nullable: true })
  creditCheckAt?: Date

  @Field(() => [DocumentAcceptance])
  documentAcceptances: DocumentAcceptance[] = []

  @Field()
  allDocumentsAccepted: boolean = false

  @Field({ nullable: true })
  sessionId?: string

  @Field({ nullable: true })
  userAgent?: string

  @Field({ nullable: true })
  devStep?: number

  @Field({ nullable: true })
  mockScenario?: string

  @Field()
  createdAt: Date = new Date()

  @Field()
  updatedAt: Date = new Date()

  @Field({ nullable: true })
  submittedAt?: Date

  @Field()
  lastActivity: Date = new Date()
}

@ObjectType()
export class State {
  @Field()
  code: string = ''

  @Field()
  name: string = ''
}

@ObjectType()
export class Country {
  @Field()
  code: string = ''

  @Field()
  name: string = ''
}

@ObjectType()
export class IdentificationType {
  @Field()
  value: string = ''

  @Field()
  label: string = ''

  @Field()
  requiresState: boolean = false
}

@ObjectType()
export class Product {
  @Field()
  type: string = ''

  @Field()
  title: string = ''

  @Field()
  description: string = ''

  @Field()
  icon: string = ''
}

@ObjectType()
export class Document {
  @Field()
  id: string = ''

  @Field()
  name: string = ''

  @Field({ nullable: true })
  description?: string

  @Field()
  url: string = ''

  @Field()
  required: boolean = false

  @Field()
  category: string = ''
}

@ObjectType()
export class DocumentRule {
  @Field(() => [String], { nullable: true })
  productTypes?: string[]

  @Field({ nullable: true })
  hasSSN?: boolean

  @Field({ nullable: true })
  noSSN?: boolean

  @Field(() => [String])
  documentIds: string[] = []
}

@ObjectType()
export class DocumentConfig {
  @Field()
  showAcceptAllButton: boolean = false

  @Field(() => [Document])
  documents: Document[] = []

  @Field(() => [DocumentRule])
  rules: DocumentRule[] = []
}

@ObjectType()
export class BankContact {
  @Field()
  phone: string = ''

  @Field()
  phoneDisplay: string = ''

  @Field()
  email: string = ''

  @Field()
  hours: string = ''
}

@ObjectType()
export class BankBranding {
  @Field()
  primaryColor: string = ''

  @Field()
  logoIcon: string = ''
}

@ObjectType()
export class BankInfo {
  @Field()
  bankName: string = ''

  @Field()
  displayName: string = ''

  @Field(() => BankContact)
  contact: BankContact = new BankContact()

  @Field(() => BankBranding)
  branding: BankBranding = new BankBranding()
}

@ObjectType()
export class CreditCheckResult {
  @Field()
  status: string = ''

  @Field()
  requiresVerification: boolean = false

  @Field()
  message: string = ''
}

@ObjectType()
export class ApplicationResult {
  @Field()
  applicationId: string = ''

  @Field()
  status: string = ''

  @Field()
  message: string = ''

  @Field()
  filename: string = ''
}

@ObjectType()
export class Translation {
  @Field()
  key: string = ''

  @Field()
  value: string = ''
}

@ObjectType()
export class TranslationManifest {
  @Field(() => [String])
  languages: string[] = []

  @Field(() => [String])
  namespaces: string[] = []
}

@ObjectType()
export class SessionInfo {
  @Field()
  sessionId: string = ''

  @Field()
  visitCount: number = 0

  @Field({ nullable: true })
  lastVisit?: Date

  @Field()
  storeType: string = ''
}

@ObjectType()
export class AdminStatus {
  @Field()
  isAuthenticated: boolean = false

  @Field({ nullable: true })
  username?: string
}

@ObjectType()
export class HealthStatus {
  @Field()
  status: string = ''

  @Field()
  timestamp: Date = new Date()
}