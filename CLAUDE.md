# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- Install dependencies: `pnpm install`
- Run both frontend and backend (recommended): `pnpm run dev`
- Run frontend dev server only: `pnpm run dev:frontend`
- Run backend API server only: `pnpm run dev:server`
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

## Environment Variables

- `VITE_API_URL`: Specifies the base URL for the backend API server. Defaults to `http://localhost:3000/api`. 
  - Example: `VITE_API_URL=https://api.example.com` would make the app fetch config from `https://api.example.com/config/states`, etc.
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