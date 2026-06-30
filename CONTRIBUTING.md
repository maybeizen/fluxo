# Contributing to Fluxo

Thank you for your interest in contributing to Fluxo! This document covers
local setup, branch conventions, and the checks we expect before opening a PR.

## License

Fluxo is licensed under **AGPL-3.0-or-later**. By contributing, you agree that
your contributions will be licensed under the same terms.

## Prerequisites

- [Bun](https://bun.sh/) 1.3.x
- PostgreSQL 16+
- Redis 7+

## Local setup

```bash
git clone https://github.com/maybeizen/fluxo.git
cd fluxo
cp .env.example .env   # edit with your local values — never commit .env
bun install
bun run --filter @fluxo/db db:migrate
bun dev
```

See [DEPLOY.md](DEPLOY.md) for Docker and production server setup.

## Branch conventions

- **`main`** — stable releases
- **`dev`** — integration branch; open PRs here
- Feature branches: `feat/<short-description>`, `fix/<short-description>`

## Before opening a PR

Run these from the repository root:

```bash
bun run format:check
bun run lint
bun run types
bun run build
```

Fix any failures before requesting review.

## Commit style

Use clear, imperative commit messages:

- `feat: add configurable option pricing`
- `fix: handle missing Discord OAuth env in CI`
- `docs: update deployment guide`

Squash unrelated changes into focused commits when possible.

## Pull requests

1. Branch from `dev`
2. Fill out the PR template
3. Link related issues
4. Ensure CI passes

## Questions

Open a [GitHub Discussion](https://github.com/maybeizen/fluxo/discussions) or
file an issue if something is unclear.
