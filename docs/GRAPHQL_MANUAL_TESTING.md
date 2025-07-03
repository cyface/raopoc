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

## 📋 Comprehensive Query Examples

### Configuration Data Queries

#### Get All Configuration Data
```graphql
query GetAllConfig {
  states {
    code
    name
  }
  countries {
    code
    name
  }
  identificationTypes {
    value
    label
    requiresState
  }
  products {
    type
    title
    description
    icon
  }
  documentConfig {
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
  bankInfo {
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

#### Bank-Specific Configuration
```graphql
query BankSpecificConfig {
  # Default configuration
  defaultStates: states {
    code
    name
  }
  defaultProducts: products {
    type
    title
    description
  }
  
  # Bank-specific configuration
  santanderStates: states(bankSlug: "santander") {
    code
    name
  }
  santanderProducts: products(bankSlug: "santander") {
    type
    title
    description
  }
  santanderBankInfo: bankInfo(bankSlug: "santander") {
    bankName
    displayName
    contact {
      phone
      email
    }
  }
}
```

### Lead Data Queries

#### Complete Lead Information
```graphql
query GetCompleteLeadInfo($leadId: ID!) {
  lead(id: $leadId) {
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
    sessionId
    userAgent
    devStep
    mockScenario
    createdAt
    updatedAt
    submittedAt
    lastActivity
  }
}
```

#### Lead by Session ID
```graphql
query GetLeadBySession($sessionId: String!) {
  leadBySessionId(sessionId: $sessionId) {
    id
    status
    currentStep
    selectedProducts
    customerInfo {
      firstName
      lastName
      email
    }
    identificationInfo {
      identificationType
      noSSN
    }
    financialInstitution
    language
  }
}
```

#### All Leads with Filtering (Admin)
```graphql
query GetAllLeads($filter: LeadFilterInput) {
  leads(filter: $filter) {
    id
    status
    currentStep
    selectedProducts
    customerInfo {
      firstName
      lastName
      email
    }
    financialInstitution
    language
    createdAt
    updatedAt
    lastActivity
  }
}

# Variables example:
# {
#   "filter": {
#     "status": "IN_PROGRESS",
#     "financialInstitution": "testbank",
#     "limit": 10,
#     "offset": 0
#   }
# }
```

### Session and Authentication Queries

#### Session Information
```graphql
query GetSessionInfo {
  sessionInfo {
    sessionId
    visitCount
    lastVisit
    storeType
  }
  adminStatus {
    isAuthenticated
    username
  }
  sessionHealth {
    status
    timestamp
  }
}
```

### Translation Queries

#### Translation Data
```graphql
query GetTranslations($language: String!, $namespace: String) {
  translationManifest {
    languages
    namespaces
    version
    lastModified
  }
  
  # Get specific namespace translations
  commonTranslations: translations(language: $language, namespace: "common")
  
  # Get all translations for a language
  allTranslations: translations(language: $language)
}

# Variables example:
# {
#   "language": "es",
#   "namespace": "common"
# }
```

### Health Check Queries

#### System Health Status
```graphql
query GetSystemHealth {
  healthCheck {
    status
    timestamp
  }
  sessionHealth {
    status
    timestamp
  }
  translationHealth {
    status
    timestamp
  }
}
```

### Complex Nested Queries

#### Lead with Full Customer Journey
```graphql
query GetLeadJourney($leadId: ID!) {
  lead(id: $leadId) {
    id
    status
    currentStep
    completedSteps
    
    # Customer information
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
    
    # Identification details
    identificationInfo {
      identificationType
      identificationNumber
      state
      country
      socialSecurityNumber
      noSSN
      dateOfBirth
    }
    
    # Credit check results
    creditCheckStatus
    requiresVerification
    creditCheckMessage
    creditCheckAt
    
    # Document acceptances
    documentAcceptances {
      id
      documentId
      accepted
      acceptedAt
    }
    allDocumentsAccepted
    
    # Application metadata
    financialInstitution
    language
    theme
    sessionId
    userAgent
    devStep
    mockScenario
    
    # Timestamps
    createdAt
    updatedAt
    submittedAt
    lastActivity
  }
}
```

#### Multi-Tenant Configuration Comparison
```graphql
query CompareBankConfigurations {
  # Default bank configuration
  defaultConfig: {
    states: states {
      code
      name
    }
    products: products {
      type
      title
      description
    }
    bankInfo: bankInfo {
      bankName
      displayName
      contact {
        phone
        email
      }
    }
  }
  
  # Santander configuration
  santanderConfig: {
    states: states(bankSlug: "santander") {
      code
      name
    }
    products: products(bankSlug: "santander") {
      type
      title
      description
    }
    bankInfo: bankInfo(bankSlug: "santander") {
      bankName
      displayName
      contact {
        phone
        email
      }
    }
  }
  
  # Business bank configuration
  businessConfig: {
    states: states(bankSlug: "businessbank") {
      code
      name
    }
    products: products(bankSlug: "businessbank") {
      type
      title
      description
    }
    bankInfo: bankInfo(bankSlug: "businessbank") {
      bankName
      displayName
      contact {
        phone
        email
      }
    }
  }
}
```

### Development and Testing Queries

#### Mock Data Testing
```graphql
query GetMockDataExamples {
  # Query with development parameters
  states {
    code
    name
  }
  
  # Test different scenarios
  products {
    type
    title
    description
  }
  
  # Document rules for testing
  documentConfig {
    showAcceptAllButton
    documents {
      id
      name
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

#### Legacy Application Data
```graphql
query GetLegacyApplication($appId: ID!) {
  application(id: $appId)
}
```

## 📮 Postman Testing

### Setup
1. Create a new request
2. Method: `POST`
3. URL: `http://localhost:3000/graphql`
4. Headers: `Content-Type: application/json`

### Basic Configuration Queries

#### Get All States
```json
{
  "query": "query GetStates { states { code name } }"
}
```

#### Get All Products with Details
```json
{
  "query": "query GetProducts { products { type title description icon } }"
}
```

#### Get Bank Information
```json
{
  "query": "query GetBankInfo { bankInfo { bankName displayName contact { phone email hours } branding { primaryColor logoIcon } } }"
}
```

#### Get Document Configuration
```json
{
  "query": "query GetDocuments { documentConfig { showAcceptAllButton documents { id name description required category } rules { productTypes hasSSN noSSN documentIds } } }"
}
```

### Lead Data Queries

#### Get Complete Lead Information
```json
{
  "query": "query GetLead($leadId: ID!) { lead(id: $leadId) { id status currentStep completedSteps selectedProducts customerInfo { firstName lastName email phoneNumber mailingAddress { street city state zipCode } } identificationInfo { identificationType identificationNumber noSSN dateOfBirth } creditCheckStatus requiresVerification documentAcceptances { documentId accepted acceptedAt } financialInstitution language createdAt updatedAt } }",
  "variables": {
    "leadId": "YOUR_LEAD_ID_HERE"
  }
}
```

#### Get Lead by Session ID
```json
{
  "query": "query GetLeadBySession($sessionId: String!) { leadBySessionId(sessionId: $sessionId) { id status currentStep selectedProducts customerInfo { firstName lastName email } financialInstitution language } }",
  "variables": {
    "sessionId": "test-session-123"
  }
}
```

#### Get All Leads (Basic)
```json
{
  "query": "query GetAllLeads { leads { id status currentStep completedSteps selectedProducts financialInstitution language createdAt updatedAt lastActivity } }"
}
```

#### Get All Leads with Customer Information
```json
{
  "query": "query GetAllLeadsWithCustomers { leads { id status currentStep selectedProducts customerInfo { firstName lastName email phoneNumber } identificationInfo { identificationType noSSN } financialInstitution language createdAt lastActivity } }"
}
```

#### Get All Leads with Filtering (Admin)
```json
{
  "query": "query GetFilteredLeads($filter: LeadFilterInput) { leads(filter: $filter) { id status currentStep selectedProducts customerInfo { firstName lastName email } financialInstitution language createdAt lastActivity } }",
  "variables": {
    "filter": {
      "status": "IN_PROGRESS",
      "financialInstitution": "testbank",
      "limit": 10,
      "offset": 0
    }
  }
}
```

#### Get All Leads with Complete Details
```json
{
  "query": "query GetAllLeadsComplete { leads { id status currentStep completedSteps selectedProducts customerInfo { firstName lastName email phoneNumber mailingAddress { street city state zipCode } } identificationInfo { identificationType identificationNumber noSSN dateOfBirth } creditCheckStatus requiresVerification documentAcceptances { documentId accepted acceptedAt } allDocumentsAccepted financialInstitution language theme sessionId createdAt updatedAt submittedAt lastActivity } }"
}
```

#### Get All Leads with Pagination
```json
{
  "query": "query GetLeadsWithPagination($filter: LeadFilterInput) { leads(filter: $filter) { id status currentStep selectedProducts customerInfo { firstName lastName email } financialInstitution createdAt } }",
  "variables": {
    "filter": {
      "limit": 5,
      "offset": 0
    }
  }
}
```

### Mutation Examples

#### Create New Lead
```json
{
  "query": "mutation CreateLead($input: CreateLeadInput!) { createOrUpdateLead(input: $input) { id status currentStep sessionId selectedProducts } }",
  "variables": {
    "input": {
      "sessionId": "postman-test-001",
      "selectedProducts": ["checking", "savings"],
      "financialInstitution": "testbank",
      "language": "en",
      "currentStep": 1
    }
  }
}
```

#### Update Lead with Customer Information
```json
{
  "query": "mutation UpdateLeadStep($input: UpdateLeadStepInput!) { updateLeadStep(input: $input) { id currentStep customerInfo { firstName lastName email } } }",
  "variables": {
    "input": {
      "leadId": "YOUR_LEAD_ID",
      "currentStep": 2,
      "completedSteps": [1],
      "stepData": "{\"customerInfo\":{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"phoneNumber\":\"555-123-4567\",\"mailingAddress\":{\"street\":\"123 Main St\",\"city\":\"New York\",\"state\":\"NY\",\"zipCode\":\"10001\"},\"useSameAddress\":true}}"
    }
  }
}
```

#### Perform Credit Check
```json
{
  "query": "mutation PerformCreditCheck($input: CreditCheckInput!) { performCreditCheck(input: $input) { status requiresVerification message } }",
  "variables": {
    "input": {
      "ssn": "123-45-6789"
    }
  }
}
```

#### Submit Lead
```json
{
  "query": "mutation SubmitLead($leadId: ID!) { submitLead(leadId: $leadId) { id status submittedAt } }",
  "variables": {
    "leadId": "YOUR_LEAD_ID"
  }
}
```

### Session and Authentication

#### Get Session Information
```json
{
  "query": "query GetSession { sessionInfo { sessionId visitCount lastVisit storeType } adminStatus { isAuthenticated username } }"
}
```

#### Session Login
```json
{
  "query": "mutation SessionLogin($input: SessionLoginInput!) { sessionLogin(input: $input) }",
  "variables": {
    "input": {
      "username": "test@example.com"
    }
  }
}
```

#### Admin Login
```json
{
  "query": "mutation AdminLogin($input: AdminLoginInput!) { adminLogin(input: $input) }",
  "variables": {
    "input": {
      "username": "admin",
      "password": "password"
    }
  }
}
```

### Multi-Tenant Configuration

#### Bank-Specific Configuration
```json
{
  "query": "query BankConfig($bankSlug: String) { states(bankSlug: $bankSlug) { code name } products(bankSlug: $bankSlug) { type title description } bankInfo(bankSlug: $bankSlug) { bankName displayName contact { phone email } } }",
  "variables": {
    "bankSlug": "santander"
  }
}
```

### Translation Queries

#### Get Translation Data
```json
{
  "query": "query GetTranslations($language: String!, $namespace: String) { translationManifest { languages namespaces version } translations(language: $language, namespace: $namespace) }",
  "variables": {
    "language": "es",
    "namespace": "common"
  }
}
```

### Health Checks
```json
{
  "query": "query HealthChecks { healthCheck { status timestamp } sessionHealth { status timestamp } translationHealth { status timestamp } }"
}
```

## 💻 curl Testing

### Simple Query
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ states { code name } }"}'
```

### Configuration Data Examples
```bash
# Get all states
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ states { code name } }"}'

# Get all products  
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products { type title description icon } }"}'

# Get bank info
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ bankInfo { bankName displayName contact { phone email } } }"}'

# Get document configuration
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ documentConfig { showAcceptAllButton documents { id name required } } }"}'
```

### Lead Data Examples
```bash
# Get lead by ID (replace YOUR_LEAD_ID)
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query($id: ID!) { lead(id: $id) { id status currentStep selectedProducts } }", "variables": {"id": "YOUR_LEAD_ID"}}'

# Get lead by session ID
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query($sessionId: String!) { leadBySessionId(sessionId: $sessionId) { id status currentStep } }", "variables": {"sessionId": "test-session-123"}}'

# Get all leads (basic) - admin only
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ leads { id status currentStep completedSteps selectedProducts financialInstitution language createdAt lastActivity } }"}'

# Get all leads with customer info - admin only
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ leads { id status currentStep selectedProducts customerInfo { firstName lastName email phoneNumber } identificationInfo { identificationType noSSN } financialInstitution language createdAt } }"}'

# Get filtered leads with variables - admin only
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query($filter: LeadFilterInput) { leads(filter: $filter) { id status currentStep selectedProducts customerInfo { firstName lastName email } financialInstitution createdAt } }", "variables": {"filter": {"status": "IN_PROGRESS", "limit": 5}}}'

# Get leads with pagination
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query($filter: LeadFilterInput) { leads(filter: $filter) { id status currentStep selectedProducts financialInstitution createdAt } }", "variables": {"filter": {"limit": 10, "offset": 0}}}'
```

### Session and Translation Examples
```bash
# Get session info
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ sessionInfo { sessionId visitCount storeType } }"}'

# Get translation manifest
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ translationManifest { languages namespaces version } }"}'

# Get translations for Spanish
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query($lang: String!) { translations(language: $lang) }", "variables": {"lang": "es"}}'
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

## 🔄 Practical Testing Workflows

### Workflow 1: Complete Data Retrieval for New Customer

```graphql
# Step 1: Get all configuration data needed for the form
query GetInitialConfig {
  states { code name }
  countries { code name }
  identificationTypes { value label requiresState }
  products { type title description icon }
  documentConfig {
    showAcceptAllButton
    documents { id name required category }
    rules { productTypes hasSSN noSSN documentIds }
  }
  bankInfo {
    bankName
    displayName
    contact { phone email hours }
    branding { primaryColor logoIcon }
  }
}

# Step 2: Create a lead and get the ID for further operations
mutation CreateNewLead {
  createOrUpdateLead(input: {
    sessionId: "workflow-test-001"
    selectedProducts: ["checking", "savings"]
    financialInstitution: "testbank"
    language: "en"
    currentStep: 1
  }) {
    id
    status
    currentStep
    sessionId
    selectedProducts
  }
}

# Step 3: Retrieve the created lead to verify data
query VerifyCreatedLead($leadId: ID!) {
  lead(id: $leadId) {
    id
    status
    currentStep
    completedSteps
    selectedProducts
    financialInstitution
    language
    createdAt
    lastActivity
  }
}
```

### Workflow 2: Multi-Bank Configuration Comparison

```graphql
# Compare configurations across different banks
query CompareBankConfigs {
  # Default configuration
  defaultStates: states { code name }
  defaultProducts: products { type title description }
  defaultBankInfo: bankInfo { bankName displayName }
  
  # Santander bank configuration
  santanderStates: states(bankSlug: "santander") { code name }
  santanderProducts: products(bankSlug: "santander") { type title description }
  santanderBankInfo: bankInfo(bankSlug: "santander") { bankName displayName }
  
  # Business bank configuration
  businessStates: states(bankSlug: "businessbank") { code name }
  businessProducts: products(bankSlug: "businessbank") { type title description }
  businessBankInfo: bankInfo(bankSlug: "businessbank") { bankName displayName }
}
```

### Workflow 3: Lead Progress Tracking

```graphql
# Get all leads and their current progress
query TrackAllLeads {
  leads {
    id
    status
    currentStep
    completedSteps
    customerInfo {
      firstName
      lastName
      email
    }
    identificationInfo {
      identificationType
      noSSN
    }
    creditCheckStatus
    requiresVerification
    allDocumentsAccepted
    financialInstitution
    language
    createdAt
    lastActivity
  }
}

# Get detailed information for a specific lead
query GetLeadDetails($leadId: ID!) {
  lead(id: $leadId) {
    id
    status
    currentStep
    completedSteps
    selectedProducts
    
    # Customer details
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
    
    # Identification details
    identificationInfo {
      identificationType
      identificationNumber
      state
      country
      socialSecurityNumber
      noSSN
      dateOfBirth
    }
    
    # Credit check results
    creditCheckStatus
    requiresVerification
    creditCheckMessage
    creditCheckAt
    
    # Document status
    documentAcceptances {
      id
      documentId
      accepted
      acceptedAt
    }
    allDocumentsAccepted
    
    # Metadata
    financialInstitution
    language
    theme
    sessionId
    userAgent
    devStep
    mockScenario
    
    # Timestamps
    createdAt
    updatedAt
    submittedAt
    lastActivity
  }
}
```

### Workflow 4: Session and Translation Management

```graphql
# Get complete session and translation information
query GetSessionAndTranslations {
  # Session information
  sessionInfo {
    sessionId
    visitCount
    lastVisit
    storeType
  }
  
  # Admin status
  adminStatus {
    isAuthenticated
    username
  }
  
  # Translation manifest
  translationManifest {
    languages
    namespaces
    version
    lastModified
  }
  
  # Health checks
  healthCheck { status timestamp }
  sessionHealth { status timestamp }
  translationHealth { status timestamp }
}

# Get specific translations
query GetSpecificTranslations($language: String!, $namespace: String) {
  translations(language: $language, namespace: $namespace)
}
```

### Workflow 5: Development and Testing Scenarios

```graphql
# Test different customer scenarios
query TestCustomerScenarios {
  # Get configuration for testing
  states { code name }
  identificationTypes { value label requiresState }
  documentConfig {
    documents { id name required }
    rules { productTypes hasSSN noSSN documentIds }
  }
}

# Create test leads for different scenarios
mutation CreateTestLead($scenario: String!) {
  createOrUpdateLead(input: {
    sessionId: $scenario
    selectedProducts: ["checking"]
    financialInstitution: "testbank"
    language: "en"
    currentStep: 1
    mockScenario: $scenario
  }) {
    id
    status
    currentStep
    mockScenario
  }
}
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