# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- Install dependencies: `pnpm install`
- Build the project: `pnpm run build`
- Run development server: `pnpm run dev`
- Run tests (watch mode): `pnpm test`
- Run tests once: `pnpm test:run`
- Run tests with coverage: `pnpm test:coverage`
- Run tests with UI: `pnpm test:ui`
- TypeScript type checking: `pnpm typecheck`
- The TypeScript source files are in `src/` and compiled output goes to `dist/`

## Environment Variables

- `VITE_CONFIG_PATH`: Specifies the path where configuration files are served from. Defaults to `/config`. 
  - Example: `VITE_CONFIG_PATH=/api/config` would make the app fetch config files from `/api/config/states.json`, etc.
  - In development: Files are served from `public/config/` (copied from `config/` directory)
  - In production: Files should be available at the specified path on your web server

- `VITE_CONFIG_CACHE_TIMEOUT`: Specifies how long to cache configuration files in milliseconds. Defaults to `5000` (5 seconds).
  - Example: `VITE_CONFIG_CACHE_TIMEOUT=30000` would cache config files for 30 seconds
  - Set to `0` to disable caching entirely (always fetch fresh data)
  - Maximum allowed value: `3600000` (1 hour)
  - Invalid values will fall back to the default 5 seconds with a console warning

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