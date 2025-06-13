# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: React Router v7 Usage

**This project uses React Router v7.6.2** - ALWAYS use React Router v7 APIs and patterns:

- ✅ Import from `'react-router'` (NOT `'react-router-dom'`)
- ✅ Use `Response.json()` instead of `json()` helper
- ✅ Use route-based data loading with loaders and actions
- ✅ Use `Form` component for submissions with actions
- ✅ Use `useNavigation()` for pending states
- ✅ Route components in `src/routes/` with loaders in `src/routes/loaders/`
- ❌ DO NOT use deprecated React Router v6 patterns
- ❌ DO NOT import from `'react-router-dom'`
- ❌ DO NOT use `defer()` or `Await` components (removed in v7)

## ⚠️ CRITICAL: NestJS Backend Architecture

**This project uses NestJS** - ALWAYS follow NestJS patterns and conventions:

- ✅ Controllers in `server/controllers/` with proper decorators
- ✅ Services in `server/services/` for business logic
- ✅ DTOs in `server/dto/` with validation decorators
- ✅ Use NestJS validation pipes and class-validator
- ✅ Module-based architecture with dependency injection
- ❌ DO NOT use Express.js patterns directly
- ❌ DO NOT create routes outside of NestJS controller structure

## Development Commands

- Install dependencies: `pnpm install`
- Run both frontend and backend (recommended): `pnpm run dev`
- **Run with HTTPS (recommended for production-like testing): `pnpm run dev:https`**
- Run frontend dev server only: `pnpm run dev:frontend`
- Run backend API server only: `pnpm run dev:server`
- Run Caddy reverse proxy for HTTPS: `pnpm run dev:caddy`
- Build the frontend project: `pnpm run build`
- Build the backend server: `pnpm run build:server`
- Preview built frontend: `pnpm run preview`
- Run tests (watch mode): `pnpm test`
- Run tests once: `pnpm test:run`
- Run tests with UI: `pnpm test:ui`
- Run tests with coverage: `pnpm test:coverage`
- TypeScript type checking: `pnpm typecheck`
- Code linting: `pnpm lint`
- Code linting with auto-fix: `pnpm lint:fix`
- The TypeScript source files are in `src/` and compiled output goes to `dist/`
- The backend server files are in `server/`

## HTTPS Development Setup

For local HTTPS development, this project uses [Caddy](https://caddyserver.com/) as a reverse proxy with automatic HTTPS certificates.

### Prerequisites

1. **Install Caddy** (choose one method):
   ```bash
   # macOS with Homebrew (recommended)
   brew install caddy
   
   # Or download from https://caddyserver.com/download
   ```

2. **Add DNS entries** (one-time setup):
   ```bash
   # Add these lines to your /etc/hosts file
   sudo nano /etc/hosts
   
   # Add these entries at the end:
   127.0.0.1       app.localhost
   127.0.0.1       api.localhost
   ```

### Usage

1. **Start HTTPS development server**:
   ```bash
   pnpm run dev:https
   ```

2. **Access your application**:
   - Frontend: https://app.localhost
   - Backend API: https://api.localhost
   - The first time you visit, your browser will warn about self-signed certificates. Click "Advanced" → "Proceed to site" to continue.

3. **Trust the certificate (optional but recommended)**:
   - Caddy automatically generates self-signed certificates
   - To avoid browser warnings, you can trust Caddy's root CA:
   ```bash
   # Trust Caddy's root CA (macOS)
   sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ~/.local/share/caddy/pki/authorities/local/root.crt
   ```

### Configuration

- **Caddyfile**: Contains the reverse proxy configuration
- **Automatic HTTPS**: Caddy automatically generates and manages SSL certificates
- **CORS**: Pre-configured for cross-origin requests between frontend and backend
- **Hot reload**: Works seamlessly with Vite's development server
- **Environment**: For HTTPS development, copy `.env.https` to `.env` to use HTTPS URLs

### Troubleshooting

- **Port conflicts**: Ensure ports 5173 and 3000 are available
- **Certificate warnings**: Normal for self-signed certificates - you can safely proceed
- **DNS issues**: `.localhost` domains should work automatically on macOS
- **API calls**: Make sure to use `https://api.localhost/api` for HTTPS development (set in .env)

## Environment Variables

- `API_URL`: Specifies the base URL for the backend API server. If not set, the URL is automatically detected based on hostname. 
  - Example: `API_URL=https://api.example.com` would make the app fetch config from `https://api.example.com/config/states`, etc.
  - In development: The backend server runs on port 3000 by default
  - In production: Set this to your production API server URL

- `VITE_CONFIG_CACHE_TIMEOUT`: Specifies how long to cache configuration files in milliseconds. Defaults to `5000` (5 seconds).
  - Example: `VITE_CONFIG_CACHE_TIMEOUT=30000` would cache config files for 30 seconds
  - Set to `0` to disable caching entirely (always fetch fresh data)
  - Maximum allowed value: `3600000` (1 hour)
  - Invalid values will fall back to the default 5 seconds with a console warning

## URL Parameters

The application supports several URL parameters for configuration and development:

### Core Configuration Parameters
- **`fi`** - Financial Institution slug for multi-tenant configuration
- **`lng`** - Language code (`en`, `es`) for internationalization  
- **`dark`** - Dark mode toggle (`dark=1` enables dark theme)

### Development & Testing Parameters  
- **`devStep`** - Jump to specific onboarding step (1-5) with mock data
- **`mockScenario`** - Apply specific customer scenario for testing
  - Used with `devStep` to test different customer types
  - See "Development Testing" section for available scenarios

### Examples
```
# Multi-tenant Spanish bank with dark mode
/?fi=santander&lng=es&dark=1

# Development testing - step 3 with international customer
/?devStep=3&mockScenario=noSSN

# Complex development scenario
/?fi=testbank&lng=es&devStep=2&mockScenario=differentBilling
```

## Configuration Files

The application uses JSON configuration files in the `config/` directory:

- **Documents Configuration** (`config/documents.json`):
  - `showAcceptAllButton`: Controls whether the "Accept All Documents" button is shown in the document acceptance step. Defaults to `true`.
  - `documents`: Array of available documents with their metadata
  - `rules`: Array of rules that determine which documents are required based on selected products and customer attributes

## Project Structure

This is a modern React Router v7 + NestJS application with:

### Frontend (`src/`)
- **Router**: React Router v7 configuration in `src/router/`
- **Routes**: Route components with loaders/actions in `src/routes/`
- **Components**: Reusable React components in `src/components/`
- **Test Utils**: React Router v7 testing utilities in `src/test-utils/`
- **Main entry point**: `src/main.tsx` with React Router v7 provider

### Backend (`server/`)
- **NestJS Structure**: Controllers, services, DTOs following NestJS conventions
- **Main entry point**: `server/main.ts` with NestJS bootstrap
- **Module System**: `server/app.module.ts` with dependency injection
- **Build output**: `server/dist/` (compiled from TypeScript)

## Project Description

- Modern customer onboarding application for banks
- Goal: Smoothly guide customers through bank account setup with enterprise-grade architecture
- Key Features:
  - **React Router v7**: Route-based data loading, form actions, lazy loading
  - Product selection (checking, savings, money market) with dynamic pricing
  - Configurable workflow steps with route-based navigation
  - Personal information collection with comprehensive validation
  - KYC validation integration with credit check APIs
  - Document management with acceptance rules
  - Account funding information capture
- Workflow Characteristics:
  - **NestJS Backend**: Enterprise patterns with controllers, services, DTOs
  - Configurable across different banks with multi-tenant support
  - Dynamic field interactions with real-time validation
  - Route-based data loading for optimal performance
- Technology Stack:
  - **Frontend**: React 18 + React Router v7 + TypeScript 5+
  - **Backend**: NestJS + TypeScript (enterprise architecture)
  - **Build Tool**: Vite with HMR and optimized bundling
  - **Routing**: React Router v7 with loaders, actions, error boundaries
  - **UI Components**: Vanilla Extract CSS-in-JS with theme system
  - **Validation**: Zod (frontend) + class-validator (backend)
  - **Testing**: Vitest + React Testing Library with React Router v7 utilities

## Security and Testing

- **NestJS Security**: Enterprise-grade security with guards, pipes, and middleware
- **Multi-layer Validation**: Zod schemas (frontend) + class-validator decorators (backend)
- **PII Encryption**: AES-256-GCM encryption for all sensitive data
- **Testing**: Vitest with React Router v7 test utilities and NestJS testing module
- **Type Safety**: Strict TypeScript configuration with comprehensive type checking

## Data Validation

- **Frontend**: Zod schemas with runtime validation and type inference
- **Backend**: NestJS validation pipes with class-validator decorators
- **DTOs**: Strongly typed Data Transfer Objects for API validation
- **Route Validation**: Action functions validate form data before processing

## Data Persistence

- **NestJS Services**: Business logic in injectable services with proper DI
- **Encrypted Storage**: Customer information encrypted before persistence
- **API Integration**: Redis stream API calls for data persistence
- **Test Mocks**: Comprehensive mocks for external API calls in test suite
- **Session Management**: Redis-based session storage with encryption

## Component Systems

- There is a theme component system in ecommerce_component_system.ts

## Background Job Processing

- There will be a need to do timer-based work like sending an email after 15 minutes
- Recommended to use BullMQ for handling asynchronous and scheduled tasks

## API Calls

- **Frontend**: Use fetch with dynamic API URL detection (`getApiUrl()` utility)
- **Backend**: NestJS controllers with proper HTTP decorators and status codes
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Type Safety**: Strongly typed API interfaces with DTOs and response types

## React Router v7 Patterns

**ALWAYS follow these React Router v7 patterns:**

```typescript
// Route component with loader and action
export const customerInfoLoader: LoaderFunction = async ({ request }) => {
  // Load data before component renders
  return { data: await fetchData() }
}

export const customerInfoAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  // Process form submission
  return Response.json({ success: true }) // Use Response.json, not json()
}

// Route component
export function CustomerInfoRoute() {
  const data = useLoaderData() as LoaderData
  const navigation = useNavigation()
  
  return (
    <Form method="post"> {/* Use Form component for actions */}
      {/* Form content */}
    </Form>
  )
}
```

## NestJS Patterns

**ALWAYS follow these NestJS patterns:**

```typescript
// Controller
@Controller('api/applications')
export class ApplicationController {
  @Post()
  async create(@Body() createDto: CreateApplicationDto) {
    return this.applicationService.create(createDto)
  }
}

// Service
@Injectable()
export class ApplicationService {
  async create(data: CreateApplicationDto) {
    // Business logic here
  }
}

// DTO with validation
export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  firstName: string
  
  @IsArray()
  selectedProducts: string[]
}
```

## Development Testing with URL Parameters

This project includes comprehensive development and testing tools using URL parameters:

### DevStep Parameter (`?devStep=1-5`)

**CRITICAL for development and testing** - allows jumping to any onboarding step with pre-populated mock data:

```
?devStep=1  # Product Selection
?devStep=2  # Customer Information  
?devStep=3  # Identification Information
?devStep=4  # Document Acceptance
?devStep=5  # Confirmation Screen
```

### Mock Scenarios (`?mockScenario=scenarioName`)

Combine with `devStep` to test different customer scenarios:

```
?devStep=3&mockScenario=noSSN              # International customer
?devStep=3&mockScenario=passport            # Passport verification
?devStep=2&mockScenario=differentBilling    # Different billing address
?devStep=1&mockScenario=moneyMarket         # Money market account
?devStep=3&mockScenario=militaryId          # Military ID verification
```

### Available Mock Scenarios

When working with mock data, these scenarios are available in `src/utils/mockData.ts`:

- **`driversLicense`** - Standard driver's license (default)
- **`passport`** - Passport-based identification
- **`stateId`** - State ID verification
- **`militaryId`** - Military ID verification  
- **`noSSN`** - International customer without SSN
- **`differentBilling`** - Customer with different billing address
- **`moneyMarket`** - Money market account selection
- **`savingsOnly`** - Savings account only

### DevHelper Component

The `DevHelper` component automatically appears when `devStep` is present:
- **Fixed position** development panel (top-right)
- **Step navigation** buttons (1-5)
- **Scenario switcher** for testing different customer types
- **Real-time URL updates** when switching steps/scenarios

### Testing Guidelines

When testing the onboarding flow:

1. **Use devStep for rapid testing**: Start at any step without manually filling previous steps
2. **Test edge cases with scenarios**: Use `noSSN`, `differentBilling`, etc. for comprehensive testing
3. **Validate form behavior**: Ensure forms work with both empty and pre-populated data
4. **Test route transitions**: Verify React Router v7 loaders/actions work correctly with mock data

## Code Generation Guidelines

- **ALWAYS run typecheck and lint** after code changes: `pnpm typecheck && pnpm lint`
- **Use React Router v7 APIs only** - import from `'react-router'`
- **Follow NestJS patterns** for backend code with proper decorators
- **Write tests** using Vitest with React Router v7 test utilities
- **Validate forms** using both Zod (frontend) and class-validator (backend)
- **Use devStep for testing** - include URL parameters in test scenarios when appropriate

## Local Development

- This project should be runnable locally

## Docker Configuration

- This application should be runnable via Docker
- Requires a Dockerfile and docker-compose
- Docker-compose should include Redis for session management