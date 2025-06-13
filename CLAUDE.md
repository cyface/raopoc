# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Configuration Files

The application uses JSON configuration files in the `config/` directory:

- **Documents Configuration** (`config/documents.json`):
  - `showAcceptAllButton`: Controls whether the "Accept All Documents" button is shown in the document acceptance step. Defaults to `true`.
  - `documents`: Array of available documents with their metadata
  - `rules`: Array of rules that determine which documents are required based on selected products and customer attributes

## Project Structure

This is a minimal TypeScript project with:
- TypeScript source code in `src/`
- Main entry point: `src/index.ts`
- Build output directory: `dist/`
- TypeScript configuration uses CommonJS modules targeting ES2016

## Project Description

- Customer onboarding application for a bank
- Goal: Smoothly guide customers through bank account setup
- Key Features:
  - Product selection (checking, savings, money market)
  - Configurable workflow steps
  - Personal information collection
  - KYC validation integration
  - Account funding information capture
- Workflow Characteristics:
  - Configurable across different banks
  - Dynamic field interactions (fields can trigger additional fields)
- Technology Stack:
  - Frontend: React
  - Build Tool: Vite
  - Backend: Express
  - Routing: Node Router
  - UI Components: Vanilla Extract and Headless UI for theming

## Security and Testing

- This project should aim to be very secure
- Unit tests should be run with vitest

## Data Validation

- Data validation should happen with Zod

## Data Persistence

- Once the customer information is gathered, it should be persisted via Redis stream API calls
- Mocks for those calls should be part of the test suite
- Sessions should use redis

## Component Systems

- There is a theme component system in ecommerce_component_system.ts

## Background Job Processing

- There will be a need to do timer-based work like sending an email after 15 minutes
- Recommended to use BullMQ for handling asynchronous and scheduled tasks

## API Calls

- Backend API calls that use HTTP should use fetch

## Code Generation Guidelines

- When you create code, you should do typechecking and tests against that code before handing control back to me

## Local Development

- This project should be runnable locally

## Docker Configuration

- This application should be runnable via Docker
- Requires a Dockerfile and docker-compose
- Docker-compose should include Redis for session management