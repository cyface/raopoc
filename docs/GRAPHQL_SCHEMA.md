# GraphQL Schema Reference

This document provides a complete reference of the GraphQL schema generated from the NestJS code-first approach.

## 🏗️ Schema Overview

The GraphQL schema is automatically generated from TypeScript classes using decorators. This ensures type safety and keeps the schema synchronized with the codebase.

## 📋 Enums

### LeadStatus
```graphql
enum LeadStatus {
  DRAFT
  IN_PROGRESS  
  SUBMITTED
  APPROVED
  REQUIRES_VERIFICATION
  REJECTED
}
```

### ProductType
```graphql
enum ProductType {
  CHECKING
  SAVINGS
  MONEY_MARKET
}
```

### CreditStatus
```graphql
enum CreditStatus {
  APPROVED
  REQUIRES_VERIFICATION
  PENDING
  ERROR
}
```

## 🎯 Object Types

### Lead
```graphql
type Lead {
  id: ID!
  status: LeadStatus!
  currentStep: Int!
  completedSteps: [Int!]!
  selectedProducts: [ProductType!]!
  customerInfo: CustomerInfo
  identificationInfo: IdentificationInfo
  financialInstitution: String
  language: String!
  theme: String
  creditCheckStatus: CreditStatus
  requiresVerification: Boolean
  creditCheckMessage: String
  creditCheckAt: DateTime
  documentAcceptances: [DocumentAcceptance!]!
  allDocumentsAccepted: Boolean!
  sessionId: String
  userAgent: String
  devStep: Int
  mockScenario: String
  createdAt: DateTime!
  updatedAt: DateTime!
  submittedAt: DateTime
  lastActivity: DateTime!
}
```

### CustomerInfo
```graphql
type CustomerInfo {
  firstName: String!
  lastName: String!
  email: String!
  phoneNumber: String!
  mailingAddress: Address!
  billingAddress: Address
  useSameAddress: Boolean!
}
```

### IdentificationInfo
```graphql
type IdentificationInfo {
  identificationType: String!
  identificationNumber: String!
  state: String
  country: String
  socialSecurityNumber: String
  noSSN: Boolean!
  dateOfBirth: String!
}
```

### Address
```graphql
type Address {
  street: String!
  city: String!
  state: String!
  zipCode: String!
}
```

### DocumentAcceptance
```graphql
type DocumentAcceptance {
  id: ID!
  leadId: String!
  documentId: String!
  accepted: Boolean!
  acceptedAt: DateTime
}
```

### Product
```graphql
type Product {
  type: String!
  title: String!
  description: String!
  icon: String!
}
```

### State
```graphql
type State {
  code: String!
  name: String!
}
```

### Country
```graphql
type Country {
  code: String!
  name: String!
}
```

### IdentificationType
```graphql
type IdentificationType {
  value: String!
  label: String!
  requiresState: Boolean!
}
```

### Document
```graphql
type Document {
  id: String!
  name: String!
  description: String
  url: String!
  required: Boolean!
  category: String!
}
```

### DocumentRule
```graphql
type DocumentRule {
  productTypes: [String!]
  hasSSN: Boolean
  noSSN: Boolean
  documentIds: [String!]!
}
```

### DocumentConfig
```graphql
type DocumentConfig {
  showAcceptAllButton: Boolean!
  documents: [Document!]!
  rules: [DocumentRule!]!
}
```

### BankContact
```graphql
type BankContact {
  phone: String!
  phoneDisplay: String!
  email: String!
  hours: String!
}
```

### BankBranding
```graphql
type BankBranding {
  primaryColor: String!
  logoIcon: String!
}
```

### BankInfo
```graphql
type BankInfo {
  bankName: String!
  displayName: String!
  contact: BankContact!
  branding: BankBranding!
}
```

### SessionInfo
```graphql
type SessionInfo {
  sessionId: String!
  visitCount: Int!
  lastVisit: DateTime
  storeType: String!
}
```

### AdminStatus
```graphql
type AdminStatus {
  isAuthenticated: Boolean!
  username: String
}
```

### TranslationManifest
```graphql
type TranslationManifest {
  languages: [String!]!
  namespaces: [String!]!
  version: String!
  lastModified: String!
}
```

### CreditCheckResult
```graphql
type CreditCheckResult {
  status: String!
  requiresVerification: Boolean!
  message: String!
}
```

### ApplicationResult
```graphql
type ApplicationResult {
  applicationId: String!
  status: String!
  message: String!
  filename: String!
}
```

### HealthStatus
```graphql
type HealthStatus {
  status: String!
  timestamp: DateTime!
}
```

## 📥 Input Types

### CreateLeadInput
```graphql
input CreateLeadInput {
  sessionId: String
  selectedProducts: [String!]
  customerInfo: CustomerInfoInput
  identificationInfo: IdentificationInfoInput
  currentStep: Int
  completedSteps: [Int!]
  financialInstitution: String
  language: String
  theme: String
  devStep: Int
  mockScenario: String
  userAgent: String
  ipAddress: String
}
```

### CustomerInfoInput
```graphql
input CustomerInfoInput {
  firstName: String!
  lastName: String!
  email: String!
  phoneNumber: String!
  mailingAddress: AddressInput!
  billingAddress: AddressInput
  useSameAddress: Boolean!
}
```

### IdentificationInfoInput
```graphql
input IdentificationInfoInput {
  identificationType: String!
  identificationNumber: String!
  state: String
  country: String
  socialSecurityNumber: String
  noSSN: Boolean!
  dateOfBirth: String!
}
```

### AddressInput
```graphql
input AddressInput {
  street: String!
  city: String!
  state: String!
  zipCode: String!
}
```

### UpdateLeadStepInput
```graphql
input UpdateLeadStepInput {
  leadId: String!
  currentStep: Int!
  completedSteps: [Int!]
  stepData: String
}
```

### UpdateLeadCreditCheckInput
```graphql
input UpdateLeadCreditCheckInput {
  leadId: String!
  status: String!
  requiresVerification: Boolean!
  message: String!
}
```

### UpdateLeadDocumentsInput
```graphql
input UpdateLeadDocumentsInput {
  leadId: String!
  acceptances: [DocumentAcceptanceInput!]!
}
```

### DocumentAcceptanceInput
```graphql
input DocumentAcceptanceInput {
  documentId: String!
  accepted: Boolean!
}
```

### CreateApplicationInput
```graphql
input CreateApplicationInput {
  selectedProducts: [ProductType!]!
  customerInfo: CustomerInfoInput
  identificationInfo: IdentificationInfoInput
  documentAcceptance: [DocumentAcceptanceInput!]
  userAgent: String
  ipAddress: String
}
```

### CreditCheckInput
```graphql
input CreditCheckInput {
  ssn: String!
}
```

### AdminLoginInput
```graphql
input AdminLoginInput {
  username: String!
  password: String!
}
```

### SessionLoginInput
```graphql
input SessionLoginInput {
  username: String!
}
```

### LeadFilterInput
```graphql
input LeadFilterInput {
  status: LeadStatus
  financialInstitution: String
  limit: Int
  offset: Int
}
```

## 🔍 Query Operations

### Lead Queries
```graphql
type Query {
  # Get a specific lead by ID
  lead(id: ID!): Lead
  
  # Get a lead by session ID
  leadBySessionId(sessionId: String!): Lead
  
  # Get all leads with optional filtering (admin)
  leads(filter: LeadFilterInput): [Lead!]!
}
```

### Configuration Queries
```graphql
type Query {
  # Get states (optionally bank-specific)
  states(bankSlug: String): [State!]!
  
  # Get countries (optionally bank-specific)
  countries(bankSlug: String): [Country!]!
  
  # Get identification types (optionally bank-specific)
  identificationTypes(bankSlug: String): [IdentificationType!]!
  
  # Get available products (optionally bank-specific)
  products(bankSlug: String): [Product!]!
  
  # Get document configuration (optionally bank-specific)
  documentConfig(bankSlug: String): DocumentConfig!
  
  # Get bank information (optionally bank-specific)
  bankInfo(bankSlug: String): BankInfo
}
```

### Session Queries
```graphql
type Query {
  # Get current session information
  sessionInfo: SessionInfo!
  
  # Get admin authentication status
  adminStatus: AdminStatus!
  
  # Check session health
  sessionHealth: HealthStatus!
}
```

### Translation Queries
```graphql
type Query {
  # Get translation manifest
  translationManifest: TranslationManifest!
  
  # Get translations (optionally by namespace)
  translations(language: String!, namespace: String): JSON!
  
  # Check translation service health
  translationHealth: HealthStatus!
}
```

### Application Queries
```graphql
type Query {
  # Get legacy application by ID
  application(id: ID!): JSON
  
  # Health check endpoint
  healthCheck: HealthStatus!
}
```

## ✏️ Mutation Operations

### Lead Mutations
```graphql
type Mutation {
  # Create or update a lead
  createOrUpdateLead(input: CreateLeadInput!): Lead!
  
  # Update lead step progress
  updateLeadStep(input: UpdateLeadStepInput!): Lead!
  
  # Update credit check results
  updateLeadCreditCheck(input: UpdateLeadCreditCheckInput!): Lead!
  
  # Update document acceptances
  updateLeadDocuments(input: UpdateLeadDocumentsInput!): [String!]!
  
  # Submit completed lead
  submitLead(leadId: ID!): Lead!
  
  # Perform credit check
  performCreditCheck(input: CreditCheckInput!): CreditCheckResult!
}
```

### Session Mutations
```graphql
type Mutation {
  # User session login
  sessionLogin(input: SessionLoginInput!): Boolean!
  
  # User session logout
  sessionLogout: Boolean!
  
  # Admin login
  adminLogin(input: AdminLoginInput!): Boolean!
  
  # Admin logout
  adminLogout: Boolean!
}
```

### Application Mutations
```graphql
type Mutation {
  # Create legacy application
  createApplication(input: CreateApplicationInput!): ApplicationResult!
}
```

## 🔧 Scalar Types

### DateTime
```graphql
scalar DateTime
```
Custom scalar for date/time values. Serialized as ISO 8601 strings.

### JSON
```graphql
scalar JSON
```
Custom scalar for arbitrary JSON data. Used for dynamic content like translations.

## 🏷️ Schema Directives

The schema uses standard GraphQL directives:

- `@deprecated(reason: String)` - Mark fields as deprecated
- `@specifiedBy(url: String)` - Link to scalar specification

## 🔍 Schema Introspection

The schema supports full introspection in development mode:

```graphql
query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    subscriptionType { name }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}
```

## 🧪 Schema Validation

All input types include validation using class-validator decorators:

- `@IsNotEmpty()` - Field cannot be empty
- `@IsString()` - Must be a string
- `@IsArray()` - Must be an array
- `@IsEnum()` - Must match enum values
- `@IsEmail()` - Must be valid email
- `@IsOptional()` - Field is optional

## 📊 Schema Stats

- **Total Types**: ~25 object types
- **Total Inputs**: ~15 input types  
- **Total Enums**: 3 enums
- **Total Queries**: ~15 query operations
- **Total Mutations**: ~10 mutation operations
- **Custom Scalars**: 2 (DateTime, JSON)

## 🔄 Schema Evolution

When updating the schema:

1. **Additive Changes**: Add new fields, types, or operations (safe)
2. **Non-breaking Changes**: Make fields optional, add enum values (safe)
3. **Breaking Changes**: Remove/rename fields, change types (requires version management)

### Versioning Strategy
- Use field deprecation before removal
- Maintain backward compatibility for at least 2 versions
- Document breaking changes in release notes
- Consider using schema federation for complex evolution

## 🎨 Best Practices

### Naming Conventions
- **Types**: PascalCase (e.g., `CustomerInfo`)
- **Fields**: camelCase (e.g., `firstName`)
- **Enums**: UPPER_CASE (e.g., `IN_PROGRESS`)
- **Inputs**: Type name + "Input" (e.g., `CreateLeadInput`)

### Field Design
- Use non-null types (`!`) for required fields
- Provide meaningful descriptions for all types and fields
- Group related fields into nested objects
- Use enums instead of strings for known values

### Input Design
- Create specific input types for each operation
- Validate all inputs using decorators
- Use optional fields for partial updates
- Include context fields (userAgent, ipAddress) when relevant

This schema provides a comprehensive, type-safe API for the banking onboarding application with full support for multi-tenancy, internationalization, and complex customer workflows.