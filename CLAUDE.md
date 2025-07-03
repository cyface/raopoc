# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Database Management

- When making schema changes, use the Prisma migration system. See docs/PRISMA_HOW_TO.md.

## ⚠️ CRITICAL: React Router v6 Usage

**This project uses React Router v6** - ALWAYS use React Router v6 APIs and patterns:

- ✅ Import from `'react-router-dom'`
- ✅ Use `json()` helper for responses
- ✅ Use route-based data loading with loaders and actions
- ✅ Use `Form` component for submissions with actions
- ✅ Use `useNavigation()` for pending states
- ✅ Route components in `src/routes/` with loaders in `src/routes/loaders/`
- ✅ Can use `defer()` and `Await` components for streaming data
- ❌ DO NOT use React Router v7 patterns (not yet migrated)

[... rest of the existing content remains unchanged ...]