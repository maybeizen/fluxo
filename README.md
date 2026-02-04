<div align="center">
  <img src="assets/fluxo.png" alt="Fluxo Logo" width="200" />
  
  # Fluxo
  
  Fluxo is an open-source billing panel targeted at hosting providers, similar to WHMCS. 
</div>

<div align="center">

## Table of Contents

</div>

- [Overview](#overview)
- [Projects](#projects)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [Team](#team)

<div align="center">

## Overview

</div>

Fluxo is an open-source billing panel targeted at hosting providers, similar to WHMCS. This monorepo contains all the applications and shared packages needed to run the billing panel, including the frontend web application, backend API, and more.

<div align="center">

## Projects

</div>

### Applications

#### **@fluxo/frontend**

The main web application frontend built with Next.js and React.

- **Port**: `5000` (development)
- **Tech Stack**: Next.js 15, React 19, Tailwind CSS 4, TypeScript
- **Location**: `apps/frontend/`

#### **@fluxo/api**

The backend REST API service providing all server-side functionality.

- **Port**: Configurable via environment variables
- **Tech Stack**: Express.js 5, MongoDB (Mongoose), Redis, Socket.IO, TypeScript
- **Location**: `apps/api/`
- **Features**:
    - User authentication and authorization
    - Service management
    - Invoice and billing system
    - Ticket support system
    - Admin dashboard API
    - WebSocket support for real-time updates
    - Email notifications
    - PDF invoice generation
    - Pterodactyl panel integration

### Shared Packages

#### **@fluxo/db**

MongoDB database connection and models package.

- **Tech Stack**: Mongoose, TypeScript
- **Location**: `packages/db/`

#### **@fluxo/types**

Shared TypeScript type definitions used across all projects.

- **Location**: `packages/types/`

#### **@fluxo/redis**

Redis client wrapper package.

- **Location**: `packages/redis/`

#### **@fluxo/eslint-config**

Shared ESLint configuration for consistent code style across the monorepo.

- **Location**: `packages/eslint-config/`

<div align="center">

## Tech Stack

</div>

### Core Technologies

- **Monorepo Management**: [Turborepo](https://turbo.build/) + [pnpm workspaces](https://pnpm.io/workspaces)
- **Package Manager**: [pnpm](https://pnpm.io/) `10.18.3`
- **Language**: [TypeScript](https://www.typescriptlang.org/) `5.9.3`
- **Build Tool**: [tsup](https://tsup.egoist.dev/) for packages, Next.js built-in for apps

### Frontend Stack

- **Framework**: [Next.js](https://nextjs.org/) `15.5.6` (with Turbopack)
- **UI Library**: [React](https://react.dev/) `19.1.0`
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) `4.x`
- **Validation**: [Zod](https://zod.dev/) `4.1.12`
- **Websockets**: [Socket.IO Client](https://socket.io/) `4.8.1`

### Backend Stack

- **Framework**: [Express.js](https://expressjs.com/) `5.1.0`
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) `8.19.0`
- **Cache/Session**: [Redis](https://redis.io/)
- **Websockets**: [Socket.IO](https://socket.io/) `4.8.1`
- **Validation**: [Zod](https://zod.dev/) `4.1.11`
- **Security**: bcrypt, express-rate-limit, CORS

<div align="center">

## Prerequisites

</div>

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x or higher
- **pnpm**: Version `10.18.3` or compatible
- **MongoDB**: Running instance (local or remote)
- **Redis**: Running instance (local or remote)

### Optional Prerequisites

- **Pterodactyl Panel**: If you need to test server management features
- **Email Service**: SMTP credentials for email functionality

<div align="center">

## Development

</div>

### Available Scripts

Run these commands from the root of the monorepo:

- `pnpm dev` - Start all applications in development mode
- `pnpm build` - Build all projects and packages
- `pnpm start` - Start all applications in production mode
- `pnpm lint` - Lint all projects
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm format` - Format all code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm test` - Run tests (if configured)
- `pnpm clean` - Clean all build artifacts

### Running Individual Projects

You can also run scripts for specific projects:

```bash
# Run a specific app
pnpm --filter @fluxo/api dev
pnpm --filter @fluxo/frontend dev

# Build a specific package
pnpm --filter @fluxo/db build
pnpm --filter @fluxo/types build
```

### Development Workflow

1. **Make changes** to the codebase
2. **Type checking** runs automatically in most editors
3. **Linting** can be checked with `pnpm lint`
4. **Formatting** can be applied with `pnpm format`
5. **Build** before committing with `pnpm build`
6. **Test** your changes locally

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Shared configuration via `@fluxo/eslint-config`
- **Prettier**: Configured with Tailwind CSS plugin for class sorting
- **Formatting**: Run `pnpm format` before committing

### Project Structure

```
fluxo/
├── apps/
│   ├── api/              # Backend API service
│   ├── bot/              # Discord bot
│   ├── docs/             # Documentation site
│   ├── frontend/         # Main web application
│   └── status/           # Status page
├── packages/
│   ├── db/               # Database models and connection
│   ├── eslint-config/   # Shared ESLint configuration
│   ├── redis/            # Redis client wrapper
│   ├── types/            # Shared TypeScript types
│   └── ui/               # Shared UI components
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── turbo.json            # Turborepo configuration
└── README.md             # This file
```

<div align="center">

## Team

</div>

**This repository and these applications** are developed and maintained by:

- **maybeizen** - Lead Developer & Maintainer

---

**Note**: This is an active development repository. Features and APIs may change without notice.
