# @fluxo/types

Shared TypeScript type definitions for the Fluxo monorepo.

## Overview

This package contains all shared TypeScript types, interfaces, and enums used across the Fluxo application. It ensures type consistency between the frontend, backend, and other packages.

## Stack

- **Language**: TypeScript (`^5.9.3`)
- **Build Tool**: tsup (`^8.5.0`)

## Prerequisites

- Node.js 20+
- TypeScript knowledge

## Getting Started

### Installation

This package is part of the Fluxo monorepo and uses workspace dependencies. Install dependencies from the root:

```bash
bun install
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

### Usage

```typescript
import { UserRole, InvoiceStatus, ServiceStatus } from '@fluxo/types'

// Use types in your code
const user: User = {
    role: UserRole.ADMIN,
    // ...
}
```

## Available Types

The package exports types for:

- Authentication & Users
- Services
- News & Content
- Coupons & Redemptions
- Products & Categories
- Invoices
- Tickets
- Settings
- Health checks

## Available Scripts

- `build` - Build the package for production
- `dev` - Watch mode for development
- `types` - Run TypeScript type checking
- `lint` - Run ESLint
- `lint:fix` - Run ESLint with auto-fix
