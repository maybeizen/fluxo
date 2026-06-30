# @fluxo/api

Backend API service for Fluxo built with Express.js and TypeScript.

## Overview

The Fluxo API provides a RESTful backend service handling authentication, user management, services, invoices, tickets, news, and more. It uses PostgreSQL for data persistence and Redis for caching and session management.

## Stack

- **Framework**: Express.js (`^5.2.1`)
- **Database**: PostgreSQL with Drizzle ORM (`^0.45.1`)
- **Cache/Sessions**: Redis (`^5.10.0`)
- **Validation**: Zod (`^4.3.6`)
- **Authentication**: bcrypt (`^6.0.0`)
- **Email**: Nodemailer (`^7.0.13`)
- **PDF Generation**: PDFKit (`^0.15.2`)
- **WebSockets**: Socket.io (`^4.8.3`)
- **Language**: TypeScript (`^5.9.3`)
- **Build Tool**: tsup (`^8.5.1`)

## Prerequisites

- Node.js 20+
- PostgreSQL database instance
- Redis server instance
- Environment variables configured (see `.env.example`)

## Getting Started

### Installation

Install dependencies from the monorepo root:

```bash
bun install
```

### Environment Setup

Create a `.env` file in the `apps/api` directory with the following variables:

```env
# Server
PORT=5001
NODE_ENV=development
APP_NAME=Fluxo API

# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/fluxo

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Session
SESSION_SECRET=your-secret-key-here

# Email (SMTP)
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=user@example.com
EMAIL_SMTP_PASS=password
EMAIL_FROM=noreply@example.com

# API URL
API_URL=http://localhost:5001
```

### Development

Start the development server with hot reload:

```bash
bun run dev
```

The API will be available at `http://localhost:5001`

### Production Build

Build for production:

```bash
bun run build
```

Start the production server:

```bash
bun run start
```

### Type Checking

Run TypeScript type checking:

```bash
bun run types
```

### Linting

Run ESLint:

```bash
bun run lint
```

Auto-fix linting issues:

```bash
bun run lint:fix
```

## API Structure

The API is organized into versioned routes:

- `/api/v1/auth` - Authentication endpoints
- `/api/v1/client` - Client-facing endpoints
- `/api/v1/admin` - Admin endpoints
- `/api/v1/public` - Public endpoints
- `/api/v1/news` - News endpoints
- `/api/v1/health` - Health check endpoint

## Features

- User authentication & authorization
- Session management with Redis
- Rate limiting
- Email verification & notifications
- PDF invoice generation
- WebSocket support for real-time updates
- Background workers for scheduled tasks
- Comprehensive request validation with Zod
- Caching layer with Redis

## Available Scripts

- `dev` - Start development server with hot reload
- `build` - Build for production
- `start` - Start production server
- `types` - Run TypeScript type checking
- `lint` - Run ESLint
- `lint:fix` - Run ESLint with auto-fix
- `migrate:users` - Run user migration script
