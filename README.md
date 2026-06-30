<div align="center">
  <img src="assets/fluxo.png" alt="Fluxo Logo" width="160" />

# Fluxo

Open-source billing panel for hosting providers — invoices, services, tickets, plugins, and payment gateways.

![CI](https://img.shields.io/github/actions/workflow/status/maybeizen/fluxo/ci.yml?branch=dev&label=CI)
![License](https://img.shields.io/github/license/maybeizen/fluxo?label=AGPL-3.0)
![Last commit](https://img.shields.io/github/last-commit/maybeizen/fluxo/dev)
![Issues](https://img.shields.io/github/issues/maybeizen/fluxo)
![Stars](https://img.shields.io/github/stars/maybeizen/fluxo?style=social)

[![Available on GitHub](https://cdn.jsdelivr.net/gh/intergrav/devins-badges@master/dist/compact/image-s/svg/github.svg)](https://github.com/maybeizen/fluxo)
[![Documentation](https://cdn.jsdelivr.net/gh/intergrav/devins-badges@master/dist/compact/documentation/website/svg/docs.svg)](https://github.com/maybeizen/fluxo/blob/dev/DEPLOY.md)

</div>

## Overview

Fluxo is a self-hosted billing and client management platform similar to WHMCS, built as a Bun monorepo with a Next.js frontend, Express API, PostgreSQL, Redis, and an extensible plugin system.

**License:** [AGPL-3.0-or-later](LICENSE) — you may use, modify, and redistribute Fluxo (including commercially), but derivative works must remain under AGPL.

## Quick start

```bash
git clone https://github.com/maybeizen/fluxo.git
cd fluxo
cp .env.example .env   # edit — never commit .env
bun install
bun run --filter @fluxo/db db:migrate
bun dev
```

- Frontend: http://localhost:5000
- API: http://localhost:3001

## Documentation

| Topic                        | Link                                     |
| ---------------------------- | ---------------------------------------- |
| Deployment (Docker + server) | [DEPLOY.md](DEPLOY.md)                   |
| Contributing                 | [CONTRIBUTING.md](CONTRIBUTING.md)       |
| Security                     | [SECURITY.md](SECURITY.md)               |
| Plugins                      | [docs/README.md](docs/README.md)         |
| Code of Conduct              | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |

## Tech stack

- **Runtime:** [Bun](https://bun.sh/) 1.3.x, [Turborepo](https://turbo.build/)
- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **API:** Express 5, Socket.IO, Zod
- **Data:** PostgreSQL 16, Drizzle ORM, Redis 7
- **Plugins:** `@fluxo/forge` SDK (server, gateway, theme plugins)

## Monorepo layout

```
fluxo/
├── apps/api/          # Express REST + WebSocket API
├── apps/frontend/     # Next.js client + admin UI
├── apps/cli/          # fluxo CLI
├── packages/          # db, forge, plugin-manager, types, …
├── plugins/           # Server/gateway/theme plugins
├── scripts/           # Bare-metal install & systemd units
└── docker-compose.yml # Docker deployment stack
```

## Development

```bash
bun run format:check
bun run lint
bun run types
bun run build
bun dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for branch/PR conventions.

## Maintainer

**maybeizen** — [github.com/maybeizen](https://github.com/maybeizen)
