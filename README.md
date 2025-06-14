# Bank Customer Onboarding Application

A modern, secure React-based customer onboarding application for banks that provides a smooth, multi-step account setup process with comprehensive data protection, built with React Router v7 and NestJS.

## Features

### 🏦 Customer Onboarding
- Multi-step guided onboarding flow with progress indicators and step validation
- Product selection (checking, savings, money market accounts) with dynamic pricing
- Customer information collection with comprehensive form validation using Zod schemas
- Identification document management (driver's license, passport, state ID, military ID)
- Address management with separate billing address option and state validation
- Phone number formatting and validation with international support
- Date of birth input with autocomplete support and age validation
- SSN validation with "No SSN" option for ITIN holders and credit check integration

### 🔒 Security & Privacy
- **End-to-end encryption** for all sensitive PII data (SSN, addresses, phone numbers, etc.)
- **NestJS Backend**: Enterprise-grade API with built-in security, validation, and middleware
- AES-256-GCM encryption with automatic key management and secure key storage
- DTO validation and transformation using NestJS decorators and class-validator
- Secure application submission and storage with audit trails
- Credit check integration with configurable validation rules and rate limiting

### 📄 Document Management
- Dynamic document acceptance based on selected products and customer profile
- PDF document viewer and download functionality
- Configurable document requirements per bank and product type
- Multi-language document support (English/Spanish)

### 🌐 Multi-language & Multi-tenant
- Full internationalization (i18n) support with English and Spanish
- Bank-specific configurations and branding
- Configurable workflows and validation rules
- Dynamic content loading based on bank context

### 🎨 Modern UI/UX
- Responsive design optimized for mobile and desktop with modern CSS Grid and Flexbox
- Accessible components with comprehensive ARIA support and keyboard navigation
- Advanced theme system with bank-specific branding and CSS custom properties
- Progressive loading states, error boundaries, and graceful error handling
- Autocomplete support for password managers and form field optimization

## Prerequisites

- **Node.js 20+**
- **pnpm** (install with `npm install -g pnpm`)
- **For HTTPS development**: Caddy (install with `brew install caddy`)
- **TypeScript 5+** for enhanced type safety

## Installation

```bash
pnpm install
```

## Development

### Standard HTTP Development
```bash
# Start both frontend and backend
pnpm run dev

# Start frontend only (port 5173)
pnpm run dev:frontend

# Start backend API only (port 3000)
pnpm run dev:server
```

### HTTPS Development (Recommended)
For production-like testing with automatic SSL certificates:

```bash
# Install Caddy (one-time setup)
brew install caddy

# Start with HTTPS
pnpm run dev:https
```

**Access your application:**
- 🌐 Frontend: https://app.localhost
- 🔌 Backend API: https://api.localhost

**First-time setup:** Your browser will warn about self-signed certificates. Click "Advanced" → "Proceed to site" to continue.

### Testing & Quality Assurance
```bash
# Run tests in watch mode
pnpm test

# Run tests once (for CI/scripts)
pnpm test:run

# Run tests with coverage
pnpm test:coverage

# Run tests with UI
pnpm test:ui

# Type check without building
pnpm typecheck

# Lint code
pnpm lint

# Lint and fix issues
pnpm lint:fix
```

### Development Testing with URL Parameters

The application includes powerful development testing features using URL parameters:

#### DevStep Parameter
Jump directly to any onboarding step with pre-populated mock data:

```bash
# Jump to step 2 (Customer Info) with mock data
http://localhost:5173/?devStep=2

# Jump to step 3 (Identification) with mock data
http://localhost:5173/?devStep=3

# Available steps: 1-5 (Product Selection → Confirmation)
```

#### Mock Scenarios
Test different customer scenarios by combining `devStep` with `mockScenario`:

```bash
# Test international customer (no SSN)
http://localhost:5173/?devStep=3&mockScenario=noSSN

# Test customer with passport
http://localhost:5173/?devStep=3&mockScenario=passport

# Test different billing address
http://localhost:5173/?devStep=2&mockScenario=differentBilling

# Test money market account selection
http://localhost:5173/?devStep=1&mockScenario=moneyMarket
```

**Available Mock Scenarios:**
- `driversLicense` - Standard driver's license verification
- `passport` - Passport-based identification
- `stateId` - State ID verification
- `militaryId` - Military ID verification
- `noSSN` - International customer without SSN
- `differentBilling` - Customer with different billing address
- `moneyMarket` - Money market account selection
- `savingsOnly` - Savings account only

#### Development Helper UI
When using `devStep`, a floating development panel appears showing:
- Current step and scenario
- Quick navigation between steps (1-5)
- Scenario switcher for testing different customer types
- Real-time URL parameter updates

### Production Build
```bash
# Build frontend
pnpm run build

# Build backend
pnpm run build:server

# Preview built frontend
pnpm run preview
```

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript 5+
- **Routing**: **React Router v6**
- **Build Tool**: Vite with Hot Module Replacement and optimized bundling
- **Styling**: Vanilla Extract CSS-in-JS with theme system
- **State Management**: React Context API with optimized providers
- **Validation**: Zod schemas with type inference and runtime validation
- **Internationalization**: React i18next with dynamic loading
- **Testing**: Vitest + React Testing Library + jsdom with router testing utilities

### Backend
- **Framework**: **NestJS** with TypeScript and enterprise architecture patterns
- **Runtime**: Node.js 20+ with modern ES modules
- **Architecture**: MVC pattern with controllers, services, and DTOs
- **Validation**: NestJS validation pipes with class-validator decorators
- **Security**: AES-256-GCM encryption for PII with secure key management
- **Configuration**: NestJS Config module with hot reloading
- **Documentation**: Auto-generated OpenAPI/Swagger documentation

### Development Tools
- **HTTPS**: Caddy reverse proxy with automatic SSL
- **Process Management**: Concurrently for multi-service development
- **Code Quality**: ESLint + TypeScript strict mode
- **Git Hooks**: Husky for pre-commit validation
- **Package Manager**: pnpm for fast, efficient installations

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable React components with tests
│   ├── context/           # Context providers (onboarding, theme)
│   ├── hooks/             # Custom React hooks
│   ├── router/            # React Router v6 configuration and error boundaries
│   ├── routes/            # Route components with loaders and actions
│   │   ├── loaders/       # Route-based data loaders
│   │   └── __tests__/     # Route-specific tests
│   ├── services/          # API services and configuration management
│   ├── styles/            # Vanilla Extract theme system
│   ├── test-utils/        # Testing utilities for React Router v7
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions and helpers
├── server/                # NestJS backend application
│   ├── controllers/       # NestJS controllers (API endpoints)
│   ├── services/          # Business logic services
│   ├── dto/              # Data Transfer Objects with validation
│   ├── types/            # Backend TypeScript types
│   ├── app.module.ts     # Main NestJS application module
│   ├── main.ts           # NestJS bootstrap and server setup
│   └── nest-cli.json     # NestJS CLI configuration
├── config/               # JSON configuration files
│   ├── documents.json    # Document acceptance rules
│   ├── products.json     # Available banking products
│   ├── bank-info.json    # Bank branding and contact info
│   └── [bankslug]/       # Bank-specific configuration overrides
├── translations/         # i18n translation files (English/Spanish)
├── applications/         # Encrypted application storage
├── Caddyfile            # HTTPS reverse proxy configuration
└── .env.https           # HTTPS development environment variables
```

## Configuration

The application uses a flexible configuration system:

- **Multi-tenant**: Support for different banks with custom configurations
- **Multi-language**: English and Spanish translations with fallbacks
- **Dynamic validation**: Configurable document requirements based on products
- **Environment-based**: Different settings for development/production

## Security Features

- **NestJS Security**: Enterprise-grade backend with built-in security middleware and guards
- **PII Encryption**: All sensitive data encrypted at rest using AES-256-GCM
- **Key Management**: Automatic encryption key generation and secure storage
- **Field-level Security**: Granular encryption of SSN, addresses, phone numbers, etc.
- **DTO Validation**: Server-side validation using NestJS validation pipes and decorators
- **HTTPS Development**: Easy local SSL setup for production-like testing with Caddy
- **Input Validation**: Multi-layer validation with Zod schemas and class-validator
- **CORS Protection**: Properly configured cross-origin resource sharing
- **Route Guards**: Protected API endpoints with authentication and authorization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.