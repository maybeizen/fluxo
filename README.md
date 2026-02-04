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
- **Tech Stack**: Next.js 16.1.6, React 19.2.4, Tailwind CSS 4.1.18, TypeScript 5.9.3
- **Location**: `apps/frontend/`

#### **@fluxo/api**

The backend REST API service providing all server-side functionality.

- **Port**: Configurable via environment variables
- **Tech Stack**: Express.js 5, PostgreSQL (Drizzle ORM), Redis, Socket.IO, TypeScript
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
    - Plugin system for integrations (Pterodactyl, Proxmox, etc.)
    - Payment gateway integrations

#### **@fluxo/cli**

Command-line interface for managing Fluxo.

- **Location**: `apps/cli/`
- **Tech Stack**: Bun, TypeScript

### Shared Packages

#### **@fluxo/db**

PostgreSQL database connection and schema package.

- **Tech Stack**: Drizzle ORM `0.45.1`, Drizzle Kit `0.31.8`, PostgreSQL (postgres driver `3.4.8`), TypeScript `5.9.3`
- **Location**: `packages/db/`
- **Features**:
    - Database schema definitions
    - Migration system
    - Type-safe database queries
    - Drizzle Studio integration

#### **@fluxo/types**

Shared TypeScript type definitions used across all projects.

- **Location**: `packages/types/`

#### **@fluxo/redis**

Redis client wrapper package.

- **Location**: `packages/redis/`

#### **@fluxo/eslint-config**

Shared ESLint configuration for consistent code style across the monorepo.

- **Location**: `packages/eslint-config/`

#### **@fluxo/plugin-loader**

Plugin system for loading and managing service and gateway plugins.

- **Tech Stack**: TypeScript
- **Location**: `packages/plugin-loader/`

<div align="center">

## Tech Stack

</div>

### Core Technologies

- **Monorepo Management**: [Turborepo](https://turbo.build/) `2.8.3` + [Bun workspaces](https://bun.sh/docs/install/workspaces)
- **Package Manager**: [Bun](https://bun.sh/) `1.3.3`
- **Language**: [TypeScript](https://www.typescriptlang.org/) `5.9.3`
- **Build Tool**: [tsup](https://tsup.egoist.dev/) `8.5.1` for packages, Next.js built-in for apps

### Frontend Stack

- **Framework**: [Next.js](https://nextjs.org/) `16.1.6` (with Turbopack)
- **UI Library**: [React](https://react.dev/) `19.2.4`
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) `4.1.18`
- **Validation**: [Zod](https://zod.dev/) `4.3.6`
- **Websockets**: [Socket.IO Client](https://socket.io/) `4.8.3`
- **HTTP Client**: [Axios](https://axios-http.com/) `1.13.4`

### Backend Stack

- **Framework**: [Express.js](https://expressjs.com/) `5.2.1`
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/) `0.45.1`
- **Database Driver**: [postgres](https://github.com/porsager/postgres) `3.4.8`
- **Database Tools**: [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) `0.31.8`
- **Cache/Session**: [Redis](https://redis.io/) `5.10.0` with [connect-redis](https://github.com/tj/connect-redis) `9.0.0`
- **Websockets**: [Socket.IO](https://socket.io/) `4.8.3`
- **Validation**: [Zod](https://zod.dev/) `4.3.6`
- **Security**: bcrypt `6.0.0`, express-rate-limit `8.2.1`, CORS `2.8.6`
- **Email**: [Nodemailer](https://nodemailer.com/) `8.0.0`
- **PDF Generation**: [PDFKit](https://pdfkit.org/) `0.17.2`
- **HTTP Client**: [Axios](https://axios-http.com/) `1.13.4`
- **Payment Processing**: [Stripe](https://stripe.com/) `20.3.0`

<div align="center">

## Prerequisites

</div>

Before you begin, ensure you have the following installed:

- **Bun**: Version `1.3.3` or higher ([Install Bun](https://bun.sh/))
- **PostgreSQL**: Version 14.x or higher (running instance, local or remote)
- **Redis**: Version 7.x or higher (running instance, local or remote)

**Note**: While the project uses Bun as the package manager, some packages may still reference pnpm in their package.json files. This is being migrated gradually.

### Optional Prerequisites

- **Pterodactyl Panel**: If you need to test server management features
- **Email Service**: SMTP credentials for email functionality

<div align="center">

## Development

</div>

### Available Scripts

Run these commands from the root of the monorepo:

- `bun dev` - Start all applications in development mode
- `bun build` - Build all projects and packages
- `bun start` - Start all applications in production mode
- `bun lint` - Lint all projects
- `bun lint:fix` - Fix linting issues automatically
- `bun format` - Format all code with Prettier
- `bun format:check` - Check code formatting
- `bun test` - Run tests (if configured)
- `bun clean` - Clean all build artifacts
- `bun fluxo` - Run the Fluxo CLI tool

### Running Individual Projects

You can also run scripts for specific projects:

```bash
# Run a specific app
bun --filter @fluxo/api dev
bun --filter @fluxo/frontend dev

# Build a specific package
bun --filter @fluxo/db build
bun --filter @fluxo/types build
```

### Development Workflow

1. **Make changes** to the codebase
2. **Type checking** runs automatically in most editors
3. **Linting** can be checked with `bun lint`
4. **Formatting** can be applied with `bun format`
5. **Build** before committing with `bun build`
6. **Test** your changes locally

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Shared configuration via `@fluxo/eslint-config`
- **Prettier**: Configured with Tailwind CSS plugin for class sorting
- **Formatting**: Run `bun format` before committing

### Project Structure

```
fluxo/
├── apps/
│   ├── api/              # Backend API service (Express.js)
│   ├── cli/              # Command-line interface
│   └── frontend/          # Main web application (Next.js)
├── packages/
│   ├── db/               # PostgreSQL database schema (Drizzle ORM)
│   ├── eslint-config/   # Shared ESLint configuration
│   ├── plugin-loader/   # Plugin system for integrations
│   ├── redis/            # Redis client wrapper
│   └── types/            # Shared TypeScript types
├── plugins/              # Service and gateway plugins
├── package.json          # Root package.json
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
