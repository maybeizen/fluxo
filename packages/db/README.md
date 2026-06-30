# @fluxo/db

Database package for Fluxo providing PostgreSQL database connection and schema definitions using Drizzle ORM.

## Overview

This package centralizes all database-related functionality for the Fluxo monorepo. It provides:

- Database connection management
- Drizzle ORM schema definitions for all tables
- Re-exported Drizzle query functions for consistent imports
- Database migration utilities

## Stack

- **ORM**: Drizzle ORM (`^0.45.1`)
- **Database**: PostgreSQL (via `postgres` driver)
- **Language**: TypeScript (`^5.9.3`)
- **Build Tool**: tsup (`^8.5.1`)

## Prerequisites

- Node.js 20+
- PostgreSQL database instance
- Environment variables configured (see `.env` setup)

## Getting Started

### Installation

This package is part of the Fluxo monorepo and uses workspace dependencies. Install dependencies from the root:

```bash
bun install
```

### Environment Setup

Ensure you have the following environment variables set:

```env
POSTGRES_URL=postgresql://user:password@localhost:5432/fluxo
```

### Development

Build the package:

```bash
bun run build
```

Watch mode for development:

```bash
bun run dev
```

### Database Migrations

Generate migrations:

```bash
bun run db:generate
```

Run migrations:

```bash
bun run db:migrate
```

Push schema changes directly (development only):

```bash
bun run db:push
```

Open Drizzle Studio (database GUI):

```bash
bun run db:studio
```

### Usage

```typescript
import { connect, getDb, users, eq } from '@fluxo/db'

// Connect to database
const db = await connect({ uri: process.env.POSTGRES_URL })

// Use in your code
const [user] = await getDb()
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
```

## Available Scripts

- `build` - Build the package for production
- `dev` - Watch mode for development
- `types` - Run TypeScript type checking
- `lint` - Run ESLint
- `db:generate` - Generate database migrations
- `db:migrate` - Run database migrations
- `db:push` - Push schema changes (dev only)
- `db:studio` - Open Drizzle Studio
