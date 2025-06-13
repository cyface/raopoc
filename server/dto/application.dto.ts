import { IsNotEmpty, IsOptional, IsString, IsObject, IsArray, IsEnum } from 'class-validator'

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsArray()
  @IsEnum(['checking', 'savings', 'money-market'], { each: true })
  selectedProducts: ('checking' | 'savings' | 'money-market')[]

  @IsNotEmpty()
  @IsObject()
  customerInfo: any

  @IsOptional()
  @IsObject()
  identificationInfo?: any

  @IsOptional()
  @IsObject()
  documentAcceptance?: any

  @IsOptional()
  @IsObject()
  metadata?: any
}

export class CreditCheckDto {
  @IsNotEmpty()
  @IsString()
  ssn: string
}