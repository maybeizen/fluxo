<div align="center">

<img src="assets/fluxo.png" alt="Fluxo" width="140" />

# Fluxo

**Self-hosted billing and client management for hosting providers.**

Invoices, services, support tickets, payment gateways, and provisioning plugins — without WHMCS.

<br />

[![CI](https://img.shields.io/github/actions/workflow/status/maybeizen/fluxo/ci.yml?branch=dev&style=for-the-badge&logo=githubactions&logoColor=white&label=CI)](https://github.com/maybeizen/fluxo/actions/workflows/ci.yml)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/maybeizen/fluxo/codeql.yml?branch=dev&style=for-the-badge&logo=github&logoColor=white&label=CodeQL)](https://github.com/maybeizen/fluxo/actions/workflows/codeql.yml)
[![Last commit](https://img.shields.io/github/last-commit/maybeizen/fluxo/dev?style=for-the-badge&logo=git&logoColor=white)](https://github.com/maybeizen/fluxo/commits/dev)
[![Issues](https://img.shields.io/github/issues/maybeizen/fluxo?style=for-the-badge&logo=github&logoColor=white)](https://github.com/maybeizen/fluxo/issues)
[![Stars](https://img.shields.io/github/stars/maybeizen/fluxo?style=for-the-badge&logo=github&logoColor=white)](https://github.com/maybeizen/fluxo/stargazers)

<br />

[Deploy](DEPLOY.md) · [Documentation](docs/README.md) · [Contributing](CONTRIBUTING.md) · [Report a bug](https://github.com/maybeizen/fluxo/issues/new/choose)

</div>

---

## Features

- **Billing** — Products, invoices, coupons, PDF export, gateway plugins (Stripe)
- **Client panel** — Service dashboard, checkout, ticket support with live updates
- **Admin panel** — Users, services, news, settings, plugin management
- **Plugins** — Extensible server provisioning (`@fluxo/forge`) and payment gateways
- **Production-ready** — Docker Compose, bare-metal scripts, systemd / PM2 / Supervisor

Licensed under [AGPL-3.0-or-later](LICENSE). You may use, modify, and redistribute Fluxo commercially; derivative works must stay under AGPL.

---

## Quick start (development)

**Requires:** [Bun](https://bun.sh/) 1.3+, PostgreSQL 16+, Redis 7+

```bash
git clone https://github.com/maybeizen/fluxo.git
cd fluxo
cp .env.example .env          # configure — never commit .env
bun install
bun run --filter @fluxo/db db:migrate
bun dev
```

| Service  | URL                          |
| -------- | ---------------------------- |
| Frontend | http://localhost:5000        |
| API      | http://localhost:5001/api/v1 |

Set `NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1` in `.env` before building the frontend for production-like local testing.

---

## Deployment

For production, use **[DEPLOY.md](DEPLOY.md)** — full guides for:

- **Docker Compose** — `docker compose up -d --build`
- **Bare-metal / VPS** — [`scripts/bootstrap.sh`](scripts/bootstrap.sh) and [script reference](scripts/README.md)
- **Process managers** — [systemd](DEPLOY.md#option-a--systemd), [PM2](DEPLOY.md#option-b--pm2-recommended-without-systemd), or [Supervisor](DEPLOY.md#option-c--supervisor)
- Environment variables, TLS, backups, and [troubleshooting](DEPLOY.md#troubleshooting)

---

## Documentation

| Topic              | Link                                     |
| ------------------ | ---------------------------------------- |
| Deployment         | [DEPLOY.md](DEPLOY.md)                   |
| Deployment scripts | [scripts/README.md](scripts/README.md)   |
| Plugin development | [docs/README.md](docs/README.md)         |
| Contributing       | [CONTRIBUTING.md](CONTRIBUTING.md)       |
| Security           | [SECURITY.md](SECURITY.md)               |
| Code of conduct    | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |

---

## Tech stack

| Layer    | Technologies                                                         |
| -------- | -------------------------------------------------------------------- |
| Monorepo | [Bun](https://bun.sh/) workspaces, [Turborepo](https://turbo.build/) |
| Frontend | Next.js 16, React 19, Tailwind CSS 4                                 |
| API      | Express 5, Socket.IO, Zod                                            |
| Data     | PostgreSQL 16, Drizzle ORM, Redis 7                                  |
| Plugins  | `@fluxo/forge`, `@fluxo/plugin-manager`                              |

---

## Project structure

```
fluxo/
├── apps/
│   ├── api/              # Express REST API + WebSockets
│   ├── frontend/         # Next.js client & admin UI
│   └── cli/              # fluxo CLI (setup, users, settings, plugins)
├── packages/             # db, forge, plugin-manager, types, …
├── plugins/              # Server & gateway plugins
├── scripts/              # Server install, env setup, systemd & PM2
└── docker-compose.yml
```

---

## Development

```bash
bun run format:check   # Prettier
bun run lint           # ESLint (all workspaces)
bun run types          # TypeScript
bun run build          # Production build
bun dev                # Dev servers
bun run fluxo doctor   # Environment checks
bun run fluxo setup    # Bootstrap DB, settings, first admin
```

### CLI reference

Run `bun run fluxo help` for the full command list. Common commands:

| Command | Description |
| ------- | ----------- |
| `fluxo setup` | Verify `.env`, run migrations, seed settings, optional admin user |
| `fluxo doctor` | Check repo, env, database, and plugins |
| `fluxo users list` | List users (`--role`, `--search`, `--limit`) |
| `fluxo users create` | Create a user (flags or prompts) |
| `fluxo users get <id\|email\|username>` | User details |
| `fluxo settings show` | Show settings (secrets masked) |
| `fluxo settings smtp` | Configure SMTP |
| `fluxo settings turnstile` | Configure Cloudflare Turnstile |
| `fluxo settings app` | App name, theme color, logo |
| `fluxo settings auth` | Toggle auth restriction flags |
| `fluxo plugins list` | List installed plugins |
| `fluxo plugins new` | Scaffold a gateway or service plugin |

Requires `POSTGRES_URL` in repo-root `.env`. Settings commands that write secrets also need `ENCRYPTION_KEY` (same value as the API).

Branch **`dev`** is the integration branch; **`main`** is stable. See [CONTRIBUTING.md](CONTRIBUTING.md) for PR workflow.

---

<div align="center">

Maintained by **[maybeizen](https://github.com/maybeizen)**

</div>
