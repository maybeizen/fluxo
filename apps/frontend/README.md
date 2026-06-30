# @fluxo/frontend

Frontend application for Fluxo built with Next.js and React.

## Overview

The Fluxo frontend is a modern web application providing the user interface for the Fluxo platform. It's built with Next.js 15, React 19, and Tailwind CSS, offering a responsive and performant user experience.

## Stack

- **Framework**: Next.js (`15.5.6`) with Turbopack
- **UI Library**: React (`19.1.0`)
- **Styling**: Tailwind CSS (`^4`)
- **HTTP Client**: Axios (`^1.12.2`)
- **WebSockets**: Socket.io Client (`^4.8.1`)
- **Markdown**: react-markdown (`^10.1.0`)
- **Validation**: Zod (`^4.1.12`)
- **Language**: TypeScript (`^5`)
- **Build Tool**: Next.js built-in (Turbopack)

## Prerequisites

- Node.js 20+
- Environment variables configured (API URL, etc.)

## Getting Started

### Installation

Install dependencies from the monorepo root:

```bash
bun install
```

### Environment Setup

Create a `.env.local` file in the `apps/frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001

# Optional: Other environment variables
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-site-key
```

### Development

Start the development server:

```bash
bun run dev
```

The application will be available at `http://localhost:5000`

### Production Build

Build for production:

```bash
bun run build
```

Start the production server:

```bash
bun run start
```

### Code Quality

Run ESLint:

```bash
bun run lint
```

Format code with Prettier:

```bash
bun run format
```

Check formatting:

```bash
bun run format:check
```

## Features

- Server-side rendering (SSR) with Next.js
- Client-side routing
- Real-time updates via WebSocket
- Responsive design with Tailwind CSS
- Markdown content rendering
- Form validation with Zod
- Optimized images with Next.js Image component

## Project Structure

```
apps/frontend/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utility functions
├── public/           # Static assets
└── styles/           # Global styles
```

## Available Scripts

- `dev` - Start development server (port 5000)
- `build` - Build for production
- `start` - Start production server (port 5000)
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `format:check` - Check code formatting
