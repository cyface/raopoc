# Prisma How-To Guide

This guide provides step-by-step instructions for working with Prisma in this project, including schema changes, migrations, database synchronization, and development workflows.

## Table of Contents

- [Overview](#overview)
- [Setup & Prerequisites](#setup--prerequisites)
- [Making Schema Changes](#making-schema-changes)
- [Creating Migrations](#creating-migrations)
- [Syncing with Databases](#syncing-with-databases)
- [Development Workflows](#development-workflows)
- [Database Operations](#database-operations)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses Prisma as the ORM with PostgreSQL as the database. The Prisma schema is located at `prisma/schema.prisma` and defines the database structure for the banking onboarding application.

### Current Schema Structure

- **Lead Model**: Main entity tracking customer onboarding progress
- **DocumentAcceptance Model**: Tracks document acceptance status
- **Enums**: LeadStatus, ProductType, CreditStatus

## Setup & Prerequisites

### Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment variables** (create `.env` file):
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

### Docker Development

1. **Start PostgreSQL with Docker**:
   ```bash
   cd docker
   docker-compose up postgres -d
   ```

2. **Environment variables for Docker**:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5433/raopoc"
   ```

## Making Schema Changes

### Step 1: Modify the Schema

Edit `prisma/schema.prisma` to make your changes:

```prisma
// Example: Adding a new field to Lead model
model Lead {
  id          String   @id @default(cuid())
  // ... existing fields ...
  
  // New field
  referralCode String?  // Optional referral code
  
  @@map("leads")
}
```

### Step 2: Common Schema Operations

#### Adding a New Model

```prisma
model ApplicationNote {
  id        String   @id @default(cuid())
  leadId    String
  content   String
  createdBy String
  createdAt DateTime @default(now())
  
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  
  @@map("application_notes")
}

// Update Lead model to include the relation
model Lead {
  // ... existing fields ...
  notes     ApplicationNote[]
}
```

#### Adding Enums

```prisma
enum ApplicationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

#### Modifying Existing Fields

```prisma
model Lead {
  // Change field type (requires careful migration)
  currentStep Int @default(1) // was String before
  
  // Add constraints
  email       String @unique // add unique constraint
  
  // Make optional field required (requires data migration)
  sessionId   String // remove ? to make required
}
```

### Step 3: Validate Schema Changes

```bash
# Check schema for syntax errors
npx prisma validate
```

## Creating Migrations

### Step 1: Generate Migration

```bash
# Generate and apply migration
pnpm prisma:migrate

# Or use the full command
npx prisma migrate dev --name describe_your_changes
```

### Step 2: Migration Naming Conventions

Use descriptive names for migrations:

```bash
# Good examples
npx prisma migrate dev --name add_referral_code_to_leads
npx prisma migrate dev --name create_application_notes_table
npx prisma migrate dev --name add_unique_constraint_to_email
npx prisma migrate dev --name update_lead_status_enum

# Avoid generic names
npx prisma migrate dev --name update
npx prisma migrate dev --name changes
```

### Step 3: Review Generated Migration

Before applying, review the generated SQL in `prisma/migrations/`:

```sql
-- Example migration file
-- CreateTable
CREATE TABLE "application_notes" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_notes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Syncing with Databases

### Development Database

```bash
# Apply all pending migrations
npx prisma migrate dev

# Reset database (destroys data)
npx prisma migrate reset

# Apply specific migration
npx prisma migrate resolve --applied "20231201120000_migration_name"
```

### Production Database

```bash
# Deploy migrations to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Generate Prisma Client

After schema changes, regenerate the client:

```bash
npx prisma generate
```

## Development Workflows

### Making Changes Workflow

1. **Update schema** in `prisma/schema.prisma`
2. **Generate migration**: `pnpm prisma:migrate`
3. **Review migration** files in `prisma/migrations/`
4. **Update application code** to use new schema
5. **Run tests**: `pnpm test`
6. **Run type checking**: `pnpm typecheck`

### Testing Schema Changes

```bash
# Test with a fresh database
npx prisma migrate reset
npx prisma migrate dev

# Seed with test data if needed
npx prisma db seed
```

### Working with Branches

```bash
# Before switching branches
git add prisma/
git commit -m "Add migration for new feature"

# After switching branches with different migrations
npx prisma migrate reset  # Resets to match current branch
```

## Database Operations

### Inspecting the Database

```bash
# Open Prisma Studio
npx prisma studio

# Generate schema from existing database
npx prisma db pull

# Push schema changes without migration (development only)
npx prisma db push
```

### Data Operations

```bash
# Seed the database
npx prisma db seed

# Execute raw SQL
npx prisma db execute --file ./script.sql
```

### Backup and Restore

```bash
# Backup (using pg_dump)
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## Docker Workflows

### Docker Development Environment

```bash
# Start services
cd docker
docker-compose up postgres pgbouncer redis -d

# Check service health
docker-compose ps

# Run migrations against Docker database
DATABASE_URL="postgresql://postgres:password@localhost:5433/raopoc" npx prisma migrate dev
```

### Using PgBouncer

When using PgBouncer (connection pooler), use session mode for migrations:

```env
# For migrations (direct connection)
DATABASE_URL="postgresql://postgres:password@localhost:5433/raopoc"

# For application (through pgbouncer)
DATABASE_URL="postgresql://postgres:password@localhost:6433/raopoc"
```

### Docker Production

```bash
# Build and deploy with migrations
docker-compose up --build
```

## Environment-Specific Configurations

### Local Development
```env
DATABASE_URL="postgresql://username:password@localhost:5432/raopoc_dev"
```

### Docker Development
```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/raopoc"
```

### Production
```env
DATABASE_URL="postgresql://user:password@production-host:5432/raopoc_prod"
```

## Troubleshooting

### Common Issues

#### Migration Conflicts

```bash
# If migrations are out of sync
npx prisma migrate status

# Mark problematic migration as applied
npx prisma migrate resolve --applied "migration_name"

# Or reset and reapply
npx prisma migrate reset
```

#### Schema Validation Errors

```bash
# Check schema syntax
npx prisma validate

# Format schema file
npx prisma format
```

#### Client Generation Issues

```bash
# Regenerate client
npx prisma generate

# Clear client cache
rm -rf node_modules/.prisma
npx prisma generate
```

#### Connection Issues

```bash
# Test database connection
npx prisma db execute --stdin < /dev/null

# Check if database exists
psql $DATABASE_URL -c "\l"
```

### Schema Change Best Practices

1. **Always backup production data** before running migrations
2. **Test migrations** on a copy of production data
3. **Make incremental changes** rather than large schema overhauls
4. **Use descriptive migration names**
5. **Review generated SQL** before applying migrations
6. **Coordinate with team** on schema changes to avoid conflicts

### Data Migration Patterns

For complex data transformations:

```sql
-- Example: Migrating enum values
UPDATE "leads" SET "status" = 'IN_PROGRESS' WHERE "status" = 'STARTED';
```

### Performance Considerations

1. **Add indexes** for frequently queried fields
2. **Use database constraints** to ensure data integrity
3. **Consider connection pooling** (PgBouncer) for production
4. **Monitor query performance** with `EXPLAIN ANALYZE`

### Development vs Production

- **Development**: Use `prisma migrate dev` for interactive development
- **Production**: Use `prisma migrate deploy` for automated deployments
- **Testing**: Use `prisma migrate reset` to start fresh

## Additional Resources

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Migrate Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose PostgreSQL](https://hub.docker.com/_/postgres)