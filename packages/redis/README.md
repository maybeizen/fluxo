# @fluxo/redis

Shared Redis client package for Fluxo providing a centralized Redis connection utility.

## Overview

This package provides a simple, reusable Redis client wrapper that can be used across the Fluxo monorepo. It handles connection creation and provides a consistent interface for Redis operations.

## Stack

- **Redis Client**: `redis` (`^5.10.0`) - Node.js Redis client
- **Language**: TypeScript (`^5.9.3`)
- **Build Tool**: tsup (`^8.5.0`)

## Prerequisites

- Node.js 20+
- Redis server instance running
- Environment variables configured (if using custom Redis URI)

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
import { createRedisClient } from '@fluxo/redis'

// Create a Redis client (defaults to localhost:6379)
const redis = createRedisClient()

// Or with a custom URI
const redis = createRedisClient('redis://user:pass@host:6379')

// Use the client
await redis.set('key', 'value')
const value = await redis.get('key')
```

The client automatically handles connection and reconnection. Connection happens asynchronously, so the client is ready to use immediately.

## Available Scripts

- `build` - Build the package for production
- `dev` - Watch mode for development
- `types` - Run TypeScript type checking
- `lint` - Run ESLint
- `lint:fix` - Run ESLint with auto-fix
