# Bank Customer Onboarding Application

A secure, React-based customer onboarding application for banks that smoothly guides customers through account setup with comprehensive data protection.

## Features

### 🏦 Customer Onboarding
- Multi-step guided onboarding flow with progress indicators
- Product selection (checking, savings, money market accounts)
- Customer information collection with comprehensive form validation
- Identification document management (driver's license, passport, state ID, military ID)
- Address management with separate billing address option
- Phone number formatting and validation
- Date of birth input with autocomplete support
- SSN validation with "No SSN" option for ITIN holders

### 🔒 Security & Privacy
- **End-to-end encryption** for all sensitive PII data (SSN, addresses, phone numbers, etc.)
- AES-256-GCM encryption with automatic key management
- Secure application submission and storage
- Credit check integration with configurable validation rules

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
- Responsive design optimized for mobile and desktop
- Accessible components with ARIA support
- Theme system with bank-specific branding
- Loading states and error handling
- Autocomplete support for password managers

## Prerequisites

- Node.js 18+
- pnpm (install with `npm install -g pnpm`)
- **For HTTPS development**: Caddy (install with `brew install caddy`)

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
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with Hot Module Replacement
- **Styling**: Vanilla Extract CSS-in-JS
- **Routing**: React Router v6
- **State Management**: React Context API
- **Validation**: Zod schemas with type inference
- **Internationalization**: React i18next
- **Testing**: Vitest + React Testing Library + jsdom

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Security**: AES-256-GCM encryption for PII
- **File Watching**: Chokidar for hot config reloading
- **CORS**: Configured for cross-origin development

### Development Tools
- **HTTPS**: Caddy reverse proxy with automatic SSL
- **Process Management**: Concurrently for multi-service development
- **Code Quality**: ESLint + TypeScript strict mode
- **Git Hooks**: Husky for pre-commit validation
- **Package Manager**: pnpm for fast, efficient installations

## Project Structure

```
├── src/
│   ├── components/          # React components with tests
│   ├── context/            # Context providers (onboarding, theme)
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Internationalization setup
│   ├── services/           # API services and configuration
│   ├── styles/             # Vanilla Extract theme system
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── server/
│   ├── routes/             # Express API routes
│   ├── utils/              # Server utilities (encryption, etc.)
│   └── index.ts            # Express server entry point
├── config/                 # JSON configuration files
│   ├── documents.json      # Document acceptance rules
│   ├── products.json       # Available banking products
│   ├── bank-info.json      # Bank branding and contact info
│   └── [bankslug]/         # Bank-specific overrides
├── translations/           # i18n translation files
├── applications/           # Encrypted application storage
├── Caddyfile              # HTTPS reverse proxy config
└── .env.https             # HTTPS development environment
```

## Configuration

The application uses a flexible configuration system:

- **Multi-tenant**: Support for different banks with custom configurations
- **Multi-language**: English and Spanish translations with fallbacks
- **Dynamic validation**: Configurable document requirements based on products
- **Environment-based**: Different settings for development/production

## Security Features

- **PII Encryption**: All sensitive data encrypted at rest using AES-256-GCM
- **Key Management**: Automatic encryption key generation and secure storage
- **Field-level Security**: Granular encryption of SSN, addresses, phone numbers, etc.
- **HTTPS Development**: Easy local SSL setup for production-like testing
- **Input Validation**: Server-side validation with Zod schemas
- **CORS Protection**: Properly configured cross-origin resource sharing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.