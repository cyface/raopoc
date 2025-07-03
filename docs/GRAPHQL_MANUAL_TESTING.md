# GraphQL Manual Testing Guide

This guide provides step-by-step instructions for manually testing the GraphQL API using various tools and methods.

## 🚀 Getting Started

### Prerequisites
1. Start the database: `pnpm run dev:docker` (if using Docker)
2. Start the server: `pnpm run dev:server`
3. GraphQL endpoint: `http://localhost:3000/graphql`

### Testing Tools
- **GraphQL Playground** (built-in): `http://localhost:3000/graphql`
- **Postman**: Create HTTP POST requests
- **curl**: Command line testing
- **Frontend integration**: React Apollo Client

## 🎮 GraphQL Playground

### Access Playground
1. Start the development server
2. Open `http://localhost:3000/graphql` in your browser
3. You'll see the GraphQL Playground interface

### Basic Usage
1. **Left Panel**: Write your queries/mutations
2. **Right Panel**: View results
3. **Variables Panel**: Define query variables (bottom left)
4. **Schema Panel**: Explore the schema (right side)

### Example Session
```graphql
# 1. Create a lead
mutation CreateLead {
  createOrUpdateLead(input: {
    sessionId: "test-session-123"
    selectedProducts: ["checking", "savings"]
    financialInstitution: "testbank"
    language: "en"
    currentStep: 1
  }) {
    id
    status
    currentStep
    sessionId
  }
}

# 2. Query the lead (use the ID from step 1)
query GetLead {
  lead(id: "your-lead-id-here") {
    id
    status
    currentStep
    selectedProducts
    financialInstitution
  }
}
```

## 📮 Postman Testing

### Setup
1. Create a new request
2. Method: `POST`
3. URL: `http://localhost:3000/graphql`
4. Headers: `Content-Type: application/json`

### Query Example
```json
{
  "query": "query GetStates { states { code name } }"
}
```

### Mutation with Variables Example
```json
{
  "query": "mutation CreateLead($input: CreateLeadInput!) { createOrUpdateLead(input: $input) { id status } }",
  "variables": {
    "input": {
      "sessionId": "postman-test",
      "selectedProducts": ["checking"],
      "currentStep": 1
    }
  }
}
```

## 💻 curl Testing

### Simple Query
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ states { code name } }"}'
```

### Mutation with Variables
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateLead($input: CreateLeadInput!) { createOrUpdateLead(input: $input) { id status } }",
    "variables": {
      "input": {
        "sessionId": "curl-test",
        "selectedProducts": ["savings"],
        "currentStep": 1
      }
    }
  }'
```

## 🧪 Manual Test Scenarios

### Scenario 1: Complete Customer Onboarding

#### Step 1: Get Configuration
```graphql
query GetConfig {
  states { code name }
  products { type title description }
  identificationTypes { value label requiresState }
}
```

#### Step 2: Create Lead
```graphql
mutation CreateLead {
  createOrUpdateLead(input: {
    sessionId: "onboarding-test-001"
    selectedProducts: ["checking", "savings"]
    financialInstitution: "testbank"
    language: "en"
    currentStep: 1
  }) {
    id
    status
    currentStep
    selectedProducts
  }
}
```

#### Step 3: Add Customer Information
```graphql
mutation UpdateCustomerInfo {
  updateLeadStep(input: {
    leadId: "YOUR_LEAD_ID"
    currentStep: 2
    completedSteps: [1]
    stepData: "{\"customerInfo\":{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"phoneNumber\":\"555-123-4567\",\"mailingAddress\":{\"street\":\"123 Main St\",\"city\":\"New York\",\"state\":\"NY\",\"zipCode\":\"10001\"},\"useSameAddress\":true}}"
  }) {
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

#### Step 4: Add Identification
```graphql
mutation UpdateIdentification {
  updateLeadStep(input: {
    leadId: "YOUR_LEAD_ID"
    currentStep: 3
    completedSteps: [1, 2]
    stepData: "{\"identificationInfo\":{\"identificationType\":\"driversLicense\",\"identificationNumber\":\"DL123456789\",\"state\":\"NY\",\"socialSecurityNumber\":\"123-45-6789\",\"noSSN\":false,\"dateOfBirth\":\"1990-01-01\"}}"
  }) {
    id
    currentStep
    identificationInfo {
      identificationType
      identificationNumber
    }
  }
}
```

#### Step 5: Perform Credit Check
```graphql
mutation CreditCheck {
  performCreditCheck(input: {
    ssn: "123-45-6789"
  }) {
    status
    requiresVerification
    message
  }
}
```

#### Step 6: Handle Documents
```graphql
# Get document configuration
query GetDocuments {
  documentConfig {
    showAcceptAllButton
    documents {
      id
      name
      required
    }
  }
}

# Accept documents
mutation AcceptDocuments {
  updateLeadDocuments(input: {
    leadId: "YOUR_LEAD_ID"
    acceptances: [
      { documentId: "terms-and-conditions", accepted: true }
      { documentId: "privacy-policy", accepted: true }
    ]
  })
}
```

#### Step 7: Submit Application
```graphql
mutation SubmitLead {
  submitLead(leadId: "YOUR_LEAD_ID") {
    id
    status
    submittedAt
  }
}
```

### Scenario 2: Multi-tenant Testing

#### Test Bank-Specific Configuration
```graphql
query BankSpecificConfig {
  santanderStates: states(bankSlug: "santander") { code name }
  santanderProducts: products(bankSlug: "santander") { type title }
  santanderBankInfo: bankInfo(bankSlug: "santander") {
    bankName
    displayName
    contact { phone email }
  }
}
```

### Scenario 3: Error Handling

#### Test Invalid Lead ID
```graphql
query InvalidLead {
  lead(id: "invalid-id") {
    id
    status
  }
}
```

#### Test Credit Check with Bad SSN
```graphql
mutation BadCreditCheck {
  performCreditCheck(input: {
    ssn: "000-00-0000"  # This should be in bad SSN list
  }) {
    status
    requiresVerification
    message
  }
}
```

### Scenario 4: Session Management

#### Get Session Info
```graphql
query SessionInfo {
  sessionInfo {
    sessionId
    visitCount
    storeType
  }
}
```

#### Session Login
```graphql
mutation Login {
  sessionLogin(input: {
    username: "test@example.com"
  })
}
```

#### Admin Login
```graphql
mutation AdminLogin {
  adminLogin(input: {
    username: "admin"
    password: "password"
  })
}

query AdminStatus {
  adminStatus {
    isAuthenticated
    username
  }
}
```

### Scenario 5: Internationalization

#### Get Spanish Translations
```graphql
query SpanishTranslations {
  translationManifest {
    languages
    namespaces
  }
  
  commonSpanish: translations(language: "es", namespace: "common")
  productsSpanish: translations(language: "es", namespace: "products")
}
```

## 🔍 Testing Checklist

### Functionality Tests
- [ ] Create lead with different product combinations
- [ ] Update lead step by step
- [ ] Perform credit checks (good and bad SSNs)
- [ ] Handle document acceptances
- [ ] Submit completed applications
- [ ] Query leads with various filters

### Configuration Tests
- [ ] Test default configurations
- [ ] Test bank-specific configurations
- [ ] Verify multi-tenant isolation
- [ ] Test missing configuration handling

### Session Tests
- [ ] Session creation and tracking
- [ ] User login/logout
- [ ] Admin authentication
- [ ] Session persistence

### Error Handling Tests
- [ ] Invalid input validation
- [ ] Missing resource handling
- [ ] Service unavailable scenarios
- [ ] Authentication failures

### Performance Tests
- [ ] Large query response times
- [ ] Complex nested queries
- [ ] Multiple concurrent requests
- [ ] Memory usage monitoring

## 🚨 Common Issues and Solutions

### Issue: Schema Not Loading in Playground
**Solution**: Ensure server is running and GraphQL module is properly configured

### Issue: Authentication Errors
**Solution**: Check session middleware setup and cookie handling

### Issue: Invalid Field Errors
**Solution**: Verify field names match the schema exactly (case-sensitive)

### Issue: Variable Type Mismatches
**Solution**: Check input types in schema and ensure variables match

### Issue: Null Response Data
**Solution**: Check service method implementations and mock data

## 📊 Performance Monitoring

### Query Complexity
Monitor query depth and field count:
```graphql
# Simple query (low complexity)
query Simple {
  states { code }
}

# Complex query (high complexity)
query Complex {
  leads {
    id
    customerInfo {
      firstName
      mailingAddress {
        street
        city
      }
    }
    documentAcceptances {
      documentId
      accepted
    }
  }
}
```

### Response Time Monitoring
- Use browser dev tools Network tab
- Monitor GraphQL endpoint response times
- Check for N+1 query problems
- Validate caching effectiveness

## 🔗 Integration with Frontend

### Apollo Client Setup Example
```typescript
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'http://localhost:3000/graphql',
    credentials: 'include' // For session cookies
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    }
  }
})
```

### React Hook Usage
```typescript
import { useQuery, useMutation } from '@apollo/client'

const { data, loading, error } = useQuery(GET_LEAD, {
  variables: { id: leadId }
})

const [createLead] = useMutation(CREATE_LEAD, {
  onCompleted: (data) => {
    console.log('Lead created:', data.createOrUpdateLead.id)
  },
  onError: (error) => {
    console.error('Error creating lead:', error)
  }
})
```

This manual testing guide ensures comprehensive validation of the GraphQL API across all use cases and scenarios.