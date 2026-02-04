# Fluxo Packages

This directory contains shared packages used across the Fluxo monorepo.

## Packages

### [@fluxo/db](./db/README.md)

Database package providing PostgreSQL connection and Drizzle ORM schemas.

### [@fluxo/redis](./redis/README.md)

Shared Redis client wrapper for caching and session management.

### [@fluxo/types](./types/README.md)

Shared TypeScript type definitions used across the monorepo.

### [@fluxo/eslint-config](./eslint-config/README.md)

Centralized ESLint configuration for consistent code quality.

## Development

All packages use workspace dependencies managed by Bun. Install dependencies from the monorepo root:

```bash
bun install
```

Each package can be built independently:

```bash
cd packages/<package-name>
bun run build
```

Or build all packages from the root:

```bash
bun run build
```
