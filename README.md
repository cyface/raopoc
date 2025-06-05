# Bank Customer Onboarding Application

A React-based customer onboarding application for banks that smoothly guides customers through account setup.

## Features

- Product selection (checking, savings, money market accounts)
- Customer information collection with form validation
- Address management with separate billing address option
- Phone number formatting
- State dropdown selection
- Autocomplete support for password managers

## Prerequisites

- Node.js 16+
- pnpm (install with `npm install -g pnpm`)

## Installation

```bash
pnpm install
```

## Development

```bash
# Start development server
pnpm run dev

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

# Build for production
pnpm run build
```

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla Extract
- **Validation**: Zod
- **Testing**: Vitest + React Testing Library
- **State Management**: React Context API

## Project Structure

```
src/
├── components/       # React components
├── context/         # Context providers
├── types/           # TypeScript types
├── styles/          # Vanilla Extract styles
└── test/           # Test setup
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.