import { Field, InputType } from '@nestjs/graphql'
import { ProductType, LeadStatus } from '@prisma/client'

@InputType()
export class AddressInput {
  @Field()
  street: string = ''

  @Field()
  city: string = ''

  @Field()
  state: string = ''

  @Field()
  zipCode: string = ''
}

@InputType()
export class CustomerInfoInput {
  @Field()
  firstName: string = ''

  @Field()
  lastName: string = ''

  @Field()
  email: string = ''

  @Field()
  phoneNumber: string = ''

  @Field(() => AddressInput)
  mailingAddress: AddressInput = new AddressInput()

  @Field(() => AddressInput, { nullable: true })
  billingAddress?: AddressInput

  @Field()
  useSameAddress: boolean = false
}

@InputType()
export class IdentificationInfoInput {
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

@InputType()
export class DocumentAcceptanceInput {
  @Field()
  documentId: string = ''

  @Field()
  accepted: boolean = false
}

@InputType()
export class CreateApplicationInput {
  @Field(() => [ProductType])
  selectedProducts: ProductType[] = []

  @Field(() => CustomerInfoInput, { nullable: true })
  customerInfo?: CustomerInfoInput

  @Field(() => IdentificationInfoInput, { nullable: true })
  identificationInfo?: IdentificationInfoInput

  @Field(() => [DocumentAcceptanceInput], { nullable: true })
  documentAcceptance?: DocumentAcceptanceInput[]

  @Field({ nullable: true })
  userAgent?: string

  @Field({ nullable: true })
  ipAddress?: string
}

@InputType()
export class CreateLeadInput {
  @Field({ nullable: true })
  sessionId?: string

  @Field(() => [String], { nullable: true })
  selectedProducts?: string[]

  @Field(() => CustomerInfoInput, { nullable: true })
  customerInfo?: CustomerInfoInput

  @Field(() => IdentificationInfoInput, { nullable: true })
  identificationInfo?: IdentificationInfoInput

  @Field({ nullable: true })
  currentStep?: number

  @Field(() => [Number], { nullable: true })
  completedSteps?: number[]

  @Field({ nullable: true })
  financialInstitution?: string

  @Field({ nullable: true })
  language?: string

  @Field({ nullable: true })
  theme?: string

  @Field({ nullable: true })
  devStep?: number

  @Field({ nullable: true })
  mockScenario?: string

  @Field({ nullable: true })
  userAgent?: string

  @Field({ nullable: true })
  ipAddress?: string
}

@InputType()
export class UpdateLeadStepInput {
  @Field()
  leadId: string = ''

  @Field()
  currentStep: number = 0

  @Field(() => [Number], { nullable: true })
  completedSteps?: number[]

  @Field({ nullable: true })
  stepData?: string // JSON string for flexibility
}

@InputType()
export class UpdateLeadCreditCheckInput {
  @Field()
  leadId: string = ''

  @Field()
  status: string = ''

  @Field()
  requiresVerification: boolean = false

  @Field()
  message: string = ''
}

@InputType()
export class UpdateLeadDocumentsInput {
  @Field()
  leadId: string = ''

  @Field(() => [DocumentAcceptanceInput])
  acceptances: DocumentAcceptanceInput[] = []
}

@InputType()
export class CreditCheckInput {
  @Field()
  ssn: string = ''
}

@InputType()
export class AdminLoginInput {
  @Field()
  username: string = ''

  @Field()
  password: string = ''
}

@InputType()
export class SessionLoginInput {
  @Field()
  username: string = ''
}

@InputType()
export class LeadFilterInput {
  @Field(() => LeadStatus, { nullable: true })
  status?: LeadStatus

  @Field({ nullable: true })
  financialInstitution?: string

  @Field({ nullable: true })
  limit?: number

  @Field({ nullable: true })
  offset?: number
}