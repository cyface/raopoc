# GraphQL API Documentation

This document provides comprehensive guidance on using the GraphQL API in the RAOPOC (Banking Onboarding) application.

## 🚀 Getting Started

### GraphQL Endpoint
- **URL**: `http://localhost:3000/graphql`
- **Playground**: Available in development mode at the same URL
- **Schema**: Auto-generated from TypeScript decorators (code-first approach)

### Authentication
GraphQL operations use the same session-based authentication as the REST API. Session cookies are handled automatically by the browser.

## 📖 Schema Overview

The GraphQL schema provides unified access to all banking onboarding functionality:

### Core Types
- **Lead** - Customer application/lead management
- **Product** - Available banking products (checking, savings, money market)
- **Config** - Multi-tenant configuration (states, countries, documents)
- **Session** - User session and authentication
- **Translation** - Internationalization support

## 🔍 Query Operations

### Lead Queries

#### Get Lead by ID
```graphql
query GetLead($id: ID!) {
  lead(id: $id) {
    id
    status
    currentStep
    completedSteps
    selectedProducts
    customerInfo {
      firstName
      lastName
      email
      phoneNumber
      mailingAddress {
        street
        city
        state
        zipCode
      }
      billingAddress {
        street
        city
        state
        zipCode
      }
      useSameAddress
    }
    identificationInfo {
      identificationType
      identificationNumber
      state
      country
      socialSecurityNumber
      noSSN
      dateOfBirth
    }
    creditCheckStatus
    requiresVerification
    creditCheckMessage
    creditCheckAt
    documentAcceptances {
      id
      documentId
      accepted
      acceptedAt
    }
    allDocumentsAccepted
    financialInstitution
    language
    theme
    createdAt
    updatedAt
    submittedAt
  }
}
```

**Variables:**
```json
{
  "id": "lead-12345"
}
```

#### Get Lead by Session ID
```graphql
query GetLeadBySession($sessionId: String!) {
  leadBySessionId(sessionId: $sessionId) {
    id
    status
    currentStep
    customerInfo {
      firstName
      lastName
      email
    }
  }
}
```

#### Get All Leads (Admin)
```graphql
query GetAllLeads($filter: LeadFilterInput) {
  leads(filter: $filter) {
    id
    status
    currentStep
    financialInstitution
    language
    createdAt
    customerInfo {
      firstName
      lastName
      email
    }
  }
}
```

**Variables:**
```json
{
  "filter": {
    "status": "IN_PROGRESS",
    "financialInstitution": "santander",
    "limit": 20,
    "offset": 0
  }
}
```

### Configuration Queries

#### Get States
```graphql
query GetStates($bankSlug: String) {
  states(bankSlug: $bankSlug) {
    code
    name
  }
}
```

#### Get Products (Multi-tenant)
```graphql
query GetProducts($bankSlug: String) {
  products(bankSlug: $bankSlug) {
    type
    title
    description
    icon
  }
}
```

**Example for specific bank:**
```json
{
  "bankSlug": "santander"
}
```

#### Get Document Configuration
```graphql
query GetDocumentConfig($bankSlug: String) {
  documentConfig(bankSlug: $bankSlug) {
    showAcceptAllButton
    documents {
      id
      name
      description
      url
      required
      category
    }
    rules {
      productTypes
      hasSSN
      noSSN
      documentIds
    }
  }
}
```

#### Get Bank Information
```graphql
query GetBankInfo($bankSlug: String) {
  bankInfo(bankSlug: $bankSlug) {
    bankName
    displayName
    contact {
      phone
      phoneDisplay
      email
      hours
    }
    branding {
      primaryColor
      logoIcon
    }
  }
}
```

### Session Queries

#### Get Session Information
```graphql
query GetSessionInfo {
  sessionInfo {
    sessionId
    visitCount
    lastVisit
    storeType
  }
}
```

#### Check Admin Status
```graphql
query GetAdminStatus {
  adminStatus {
    isAuthenticated
    username
  }
}
```

### Translation Queries

#### Get Translation Manifest
```graphql
query GetTranslationManifest {
  translationManifest {
    languages
    namespaces
    version
    lastModified
  }
}
```

#### Get Translations
```graphql
query GetTranslations($language: String!, $namespace: String) {
  translations(language: $language, namespace: $namespace)
}
```

**Variables:**
```json
{
  "language": "es",
  "namespace": "common"
}
```

## ✏️ Mutation Operations

### Lead Mutations

#### Create or Update Lead
```graphql
mutation CreateOrUpdateLead($input: CreateLeadInput!) {
  createOrUpdateLead(input: $input) {
    id
    status
    currentStep
    sessionId
    financialInstitution
  }
}
```

**Variables:**
```json
{
  "input": {
    "sessionId": "session-abc123",
    "selectedProducts": ["checking", "savings"],
    "customerInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "555-123-4567",
      "mailingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "useSameAddress": true
    },
    "currentStep": 2,
    "completedSteps": [1],
    "financialInstitution": "santander",
    "language": "en",
    "theme": "light"
  }
}
```

#### Update Lead Step Progress
```graphql
mutation UpdateLeadStep($input: UpdateLeadStepInput!) {
  updateLeadStep(input: $input) {
    id
    currentStep
    completedSteps
    status
  }
}
```

**Variables:**
```json
{
  "input": {
    "leadId": "lead-12345",
    "currentStep": 3,
    "completedSteps": [1, 2],
    "stepData": "{\"identificationInfo\":{\"identificationType\":\"driversLicense\",\"identificationNumber\":\"DL123456\",\"state\":\"NY\"}}"
  }
}
```

#### Update Credit Check Results
```graphql
mutation UpdateLeadCreditCheck($input: UpdateLeadCreditCheckInput!) {
  updateLeadCreditCheck(input: $input) {
    id
    creditCheckStatus
    requiresVerification
    creditCheckMessage
    creditCheckAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "leadId": "lead-12345",
    "status": "approved",
    "requiresVerification": false,
    "message": "Credit check passed successfully"
  }
}
```

#### Update Document Acceptances
```graphql
mutation UpdateLeadDocuments($input: UpdateLeadDocumentsInput!) {
  updateLeadDocuments(input: $input)
}
```

**Variables:**
```json
{
  "input": {
    "leadId": "lead-12345",
    "acceptances": [
      {
        "documentId": "terms-and-conditions",
        "accepted": true
      },
      {
        "documentId": "privacy-policy",
        "accepted": true
      },
      {
        "documentId": "account-agreement",
        "accepted": false
      }
    ]
  }
}
```

#### Submit Lead
```graphql
mutation SubmitLead($leadId: ID!) {
  submitLead(leadId: $leadId) {
    id
    status
    submittedAt
  }
}
```

#### Perform Credit Check
```graphql
mutation PerformCreditCheck($input: CreditCheckInput!) {
  performCreditCheck(input: $input) {
    status
    requiresVerification
    message
  }
}
```

**Variables:**
```json
{
  "input": {
    "ssn": "123-45-6789"
  }
}
```

### Session Mutations

#### Session Login
```graphql
mutation SessionLogin($input: SessionLoginInput!) {
  sessionLogin(input: $input)
}
```

**Variables:**
```json
{
  "input": {
    "username": "customer@example.com"
  }
}
```

#### Session Logout
```graphql
mutation SessionLogout {
  sessionLogout
}
```

#### Admin Login
```graphql
mutation AdminLogin($input: AdminLoginInput!) {
  adminLogin(input: $input)
}
```

**Variables:**
```json
{
  "input": {
    "username": "admin",
    "password": "password"
  }
}
```

### Application Mutations (Legacy)

#### Create Application
```graphql
mutation CreateApplication($input: CreateApplicationInput!) {
  createApplication(input: $input) {
    applicationId
    status
    message
    filename
  }
}
```

**Variables:**
```json
{
  "input": {
    "selectedProducts": ["CHECKING", "SAVINGS"],
    "customerInfo": {
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "phoneNumber": "555-987-6543",
      "mailingAddress": {
        "street": "456 Oak Ave",
        "city": "Los Angeles",
        "state": "CA",
        "zipCode": "90210"
      },
      "useSameAddress": true
    },
    "identificationInfo": {
      "identificationType": "driversLicense",
      "identificationNumber": "CA987654321",
      "state": "CA",
      "socialSecurityNumber": "987-65-4321",
      "noSSN": false,
      "dateOfBirth": "1985-06-15"
    },
    "documentAcceptance": [
      {
        "documentId": "terms",
        "accepted": true
      },
      {
        "documentId": "privacy",
        "accepted": true
      }
    ],
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "ipAddress": "192.168.1.100"
  }
}
```

## 🎯 Common Use Cases

### 1. Customer Onboarding Flow

#### Step 1: Product Selection
```graphql
# Get available products
query GetProducts {
  products {
    type
    title
    description
    icon
  }
}

# Create lead with selected products
mutation CreateLead($input: CreateLeadInput!) {
  createOrUpdateLead(input: $input) {
    id
    currentStep
  }
}
```

#### Step 2: Customer Information
```graphql
# Update lead with customer info
mutation UpdateCustomerInfo($input: UpdateLeadStepInput!) {
  updateLeadStep(input: $input) {
    id
    currentStep
    customerInfo {
      firstName
      lastName
      email
    }
  }
}
```

#### Step 3: Identification
```graphql
# Get ID types
query GetIdentificationTypes {
  identificationTypes {
    value
    label
    requiresState
  }
}

# Update with identification info
mutation UpdateIdentification($input: UpdateLeadStepInput!) {
  updateLeadStep(input: $input) {
    id
    currentStep
    identificationInfo {
      identificationType
      identificationNumber
    }
  }
}

# Perform credit check
mutation PerformCreditCheck($input: CreditCheckInput!) {
  performCreditCheck(input: $input) {
    status
    requiresVerification
    message
  }
}
```

#### Step 4: Document Acceptance
```graphql
# Get document configuration
query GetDocuments {
  documentConfig {
    showAcceptAllButton
    documents {
      id
      name
      description
      required
    }
    rules {
      productTypes
      documentIds
    }
  }
}

# Update document acceptances
mutation UpdateDocuments($input: UpdateLeadDocumentsInput!) {
  updateLeadDocuments(input: $input)
}
```

#### Step 5: Submission
```graphql
# Submit completed application
mutation SubmitLead($leadId: ID!) {
  submitLead(leadId: $leadId) {
    id
    status
    submittedAt
  }
}
```

### 2. Multi-tenant Configuration

#### Get Bank-Specific Configuration
```graphql
query GetBankConfig($bankSlug: String!) {
  states(bankSlug: $bankSlug) { code name }
  countries(bankSlug: $bankSlug) { code name }
  products(bankSlug: $bankSlug) { type title description }
  documentConfig(bankSlug: $bankSlug) {
    showAcceptAllButton
    documents { id name required }
  }
  bankInfo(bankSlug: $bankSlug) {
    bankName
    displayName
    contact { phone email }
    branding { primaryColor logoIcon }
  }
}
```

### 3. Admin Lead Management

#### Get All Leads with Filtering
```graphql
query GetLeadsForAdmin($filter: LeadFilterInput) {
  leads(filter: $filter) {
    id
    status
    currentStep
    financialInstitution
    customerInfo {
      firstName
      lastName
      email
    }
    createdAt
    submittedAt
  }
}
```

### 4. Development and Testing

#### Jump to Specific Step (Development)
```graphql
mutation JumpToStep($input: CreateLeadInput!) {
  createOrUpdateLead(input: $input) {
    id
    currentStep
    devStep
    mockScenario
  }
}
```

**Variables for Development:**
```json
{
  "input": {
    "sessionId": "dev-session",
    "currentStep": 3,
    "devStep": 3,
    "mockScenario": "noSSN",
    "financialInstitution": "testbank"
  }
}
```

## 🌍 Internationalization

### Get Translations for Spanish
```graphql
query GetSpanishTranslations {
  translations(language: "es", namespace: "common")
}
```

### Get All Translation Namespaces
```graphql
query GetAllTranslations($language: String!) {
  translations(language: $language)
}
```

## 🔧 Error Handling

GraphQL provides structured error responses:

```json
{
  "errors": [
    {
      "message": "Lead not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["lead"],
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ],
  "data": {
    "lead": null
  }
}
```

### Common Error Types
- **ValidationError** - Invalid input data
- **NotFoundError** - Resource not found
- **AuthenticationError** - Authentication required
- **ServiceError** - Backend service failure

## 🧪 Testing

### Unit Tests
Run resolver unit tests:
```bash
pnpm test server/graphql
```

### Integration Tests
Run GraphQL integration tests:
```bash
pnpm test server/graphql/graphql.integration.test.ts
```

### Test with GraphQL Playground
1. Start the development server: `pnpm run dev:server`
2. Open `http://localhost:3000/graphql`
3. Use the interactive playground to test queries and mutations

## 📊 Performance Tips

### 1. Field Selection
Only request fields you need:
```graphql
# Good - specific fields
query GetLead($id: ID!) {
  lead(id: $id) {
    id
    status
    customerInfo {
      firstName
      lastName
    }
  }
}

# Avoid - requesting all fields when unnecessary
query GetLead($id: ID!) {
  lead(id: $id) {
    # ... all fields
  }
}
```

### 2. Use Variables
Always use variables instead of inline values:
```graphql
# Good
query GetLead($id: ID!) {
  lead(id: $id) { id status }
}

# Avoid
query GetLead {
  lead(id: "hardcoded-id") { id status }
}
```

### 3. Batch Operations
Use aliases to fetch multiple resources in one request:
```graphql
query GetMultipleLeads {
  lead1: lead(id: "lead-1") { id status }
  lead2: lead(id: "lead-2") { id status }
  lead3: lead(id: "lead-3") { id status }
}
```

## 🔗 Integration with Frontend

### React Hook Example
```typescript
import { useQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'

const GET_LEAD = gql`
  query GetLead($id: ID!) {
    lead(id: $id) {
      id
      status
      currentStep
      customerInfo {
        firstName
        lastName
        email
      }
    }
  }
`

const UPDATE_LEAD_STEP = gql`
  mutation UpdateLeadStep($input: UpdateLeadStepInput!) {
    updateLeadStep(input: $input) {
      id
      currentStep
      status
    }
  }
`

function LeadComponent({ leadId }: { leadId: string }) {
  const { data, loading, error } = useQuery(GET_LEAD, {
    variables: { id: leadId }
  })
  
  const [updateLeadStep] = useMutation(UPDATE_LEAD_STEP)
  
  const handleStepUpdate = async (step: number) => {
    await updateLeadStep({
      variables: {
        input: {
          leadId,
          currentStep: step,
          completedSteps: Array.from({ length: step }, (_, i) => i + 1)
        }
      }
    })
  }
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <h1>Lead: {data.lead.customerInfo?.firstName}</h1>
      <p>Status: {data.lead.status}</p>
      <p>Current Step: {data.lead.currentStep}</p>
      <button onClick={() => handleStepUpdate(data.lead.currentStep + 1)}>
        Next Step
      </button>
    </div>
  )
}
```

## 📚 Additional Resources

- **GraphQL Official Docs**: https://graphql.org/
- **Apollo Server Docs**: https://www.apollographql.com/docs/apollo-server/
- **NestJS GraphQL**: https://docs.nestjs.com/graphql/quick-start
- **GraphQL Playground**: Interactive GraphQL IDE
- **GraphQL Code Generator**: For generating TypeScript types from schema

## 🤝 Contributing

When adding new GraphQL operations:

1. Define types in `server/graphql/object-types.ts`
2. Create input types in `server/graphql/input-types.ts`
3. Implement resolvers in appropriate resolver files
4. Add comprehensive unit tests
5. Update this documentation with examples
6. Test with GraphQL Playground

## 🔐 Security Considerations

- **Input Validation**: All inputs are validated using class-validator
- **Authentication**: Session-based authentication required for protected operations
- **Rate Limiting**: Consider implementing query complexity analysis
- **Query Depth**: Monitor query depth to prevent deeply nested attacks
- **Field-Level Security**: Some fields may require additional authorization