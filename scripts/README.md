# Fluxo deployment scripts

Bash helpers for **bare-metal / VPS** installs on Debian or Ubuntu. Docker deployments use [`docker-compose.yml`](../docker-compose.yml) instead — see [DEPLOY.md](../DEPLOY.md).

All scripts are intended to be run from the **repository root** (or they resolve the root automatically via `lib.sh`).

| Script                                            | Root required?   | Purpose                                                  |
| ------------------------------------------------- | ---------------- | -------------------------------------------------------- |
| [`bootstrap.sh`](#bootstrapsh)                    | No               | Full first-time setup orchestrator                       |
| [`install-deps.sh`](#install-depssh)              | **Yes** (`sudo`) | Install PostgreSQL, Redis, Bun, Node 20                  |
| [`setup-env.sh`](#setup-envsh)                    | No               | Interactive `.env` generator                             |
| [`setup-db.sh`](#setup-dbsh)                      | No\*             | Create Postgres role/DB + run migrations                 |
| [`lib.sh`](#libsh)                                | —                | Shared helpers (sourced, not executed)                   |
| [`fluxo-api.service`](#systemd-unit-files)        | —                | systemd unit template (API)                              |
| [`fluxo-frontend.service`](#systemd-unit-files)   | —                | systemd unit template (frontend)                         |
| [`ecosystem.config.cjs`](#pm2-ecosystemconfigcjs) | —                | [PM2](https://pm2.keymetrics.io/) process manager config |

\* `setup-db.sh` uses `sudo -u postgres` when creating roles/databases.

For running Fluxo **without systemd**, see [Process managers in DEPLOY.md](../DEPLOY.md#process-managers-without-systemd) (PM2, Supervisor).

---

## Quick reference

```bash
# Full first-time install (recommended)
sudo ./scripts/bootstrap.sh

# Or step by step
sudo ./scripts/install-deps.sh
./scripts/setup-env.sh
./scripts/setup-db.sh
bun install --frozen-lockfile && bun run build

# Then choose one:
sudo cp scripts/fluxo-*.service /etc/systemd/system/ && sudo systemctl enable --now fluxo-api fluxo-frontend
# — or —
pm2 start scripts/ecosystem.config.cjs && pm2 save && pm2 startup
```

---

## bootstrap.sh

**Purpose:** One-command bootstrap for a new server.

**Usage:**

```bash
sudo ./scripts/bootstrap.sh
```

**What it does (each step is optional via prompts):**

1. Runs [`install-deps.sh`](#install-depssh) if you confirm
2. Runs [`setup-env.sh`](#setup-envsh) if `.env` does not exist
3. Runs [`setup-db.sh`](#setup-dbsh) if you confirm
4. Runs `bun install --frozen-lockfile`
5. Runs `bun run build` with `CI=true` and `.env` loaded

**When to use:** Fresh VPS, first deploy, you want guided setup.

**When not to use:** Docker installs; re-running on an existing production box (use individual scripts or git pull + build instead).

**After bootstrap:** Install a process manager — [systemd](#systemd-unit-files) or [PM2](../DEPLOY.md#option-b--pm2-recommended-without-systemd).

---

## install-deps.sh

**Purpose:** Install system packages on Debian/Ubuntu.

**Usage:**

```bash
sudo ./scripts/install-deps.sh
```

**Installs:**

| Package     | Version / notes                                         |
| ----------- | ------------------------------------------------------- |
| PostgreSQL  | distro package (16 on recent Ubuntu)                    |
| Redis       | `redis-server`                                          |
| Node.js     | 20 LTS via NodeSource (if not present)                  |
| Bun         | via `bun.sh` install script                             |
| Build tools | `curl`, `ca-certificates`, `openssl`, `build-essential` |

**Post-install:** Enables and starts `postgresql` and `redis-server` via systemd.

<details>
<summary><strong>Notes & limitations</strong></summary>

- **Root required** — uses `apt-get`
- **Debian/Ubuntu only** — other distros need manual equivalent packages
- Bun installs to `$HOME/.bun` of the user running the script (often `root` when using `sudo`). Prefer running bootstrap as your deploy user, or reinstall Bun as that user after
- Does not create Fluxo database users — use [`setup-db.sh`](#setup-dbsh)

</details>

---

## setup-env.sh

**Purpose:** Generate root `.env` interactively with optional auto-generated secrets.

**Usage:**

```bash
./scripts/setup-env.sh
```

**Prompts for:**

- App URLs (`FRONTEND_URL`, `API_URL`, `NEXT_PUBLIC_API_URL` defaulting to `{API_URL}/api/v1`)
- Secrets (`ENCRYPTION_KEY`, `SESSION_SECRET` — can auto-generate via OpenSSL)
- PostgreSQL connection pieces (composes `POSTGRES_URL`)
- Redis settings
- Discord OAuth credentials
- Optional SMTP settings

**Output:** `.env` at repo root with mode `600`.

<details>
<summary><strong>Important defaults</strong></summary>

| Field                  | Default                                   |
| ---------------------- | ----------------------------------------- |
| `NODE_ENV`             | `production`                              |
| `PORT`                 | `5001` (API)                              |
| `FRONTEND_URL`         | `http://localhost:5000`                   |
| `API_URL`              | `http://localhost:5001`                   |
| `DISCORD_REDIRECT_URI` | `{API_URL}/api/v1/discord/callback`       |
| `NEXT_PUBLIC_API_URL`  | `{API_URL}/api/v1`                        |
| `REDIS_PASSWORD`       | literal `null` when Redis has no password |

If `.env` already exists, the script asks before overwriting.

</details>

<details>
<summary><strong>When things go wrong</strong></summary>

- **Wrong API URL in browser after deploy:** `NEXT_PUBLIC_API_URL` must include `/api/v1`; rebuild frontend after changes
- **Discord OAuth fails:** ensure redirect URI matches Discord Developer Portal exactly
- **Lost `.env`:** regenerate breaks access to encrypted DB fields unless you restore the original `ENCRYPTION_KEY`

</details>

---

## setup-db.sh

**Purpose:** Create PostgreSQL role and database, optionally sync `POSTGRES_URL` in `.env`, run Drizzle migrations.

**Usage:**

```bash
./scripts/setup-db.sh
```

**Requires:** `.env` from [`setup-env.sh`](#setup-envsh) (or manual), `bun`, `psql`, `sudo` access to `postgres` OS user.

**Steps:**

1. Parses `POSTGRES_URL` for user/database names (or uses `POSTGRES_USER` / `POSTGRES_DB` env vars)
2. Optionally creates role + database via `sudo -u postgres psql`
3. Optionally updates `POSTGRES_URL` in `.env` if a new password was generated
4. Runs `bun run --filter @fluxo/db db:migrate`

<details>
<summary><strong>Existing PostgreSQL / remote DB</strong></summary>

Skip role creation when prompted if you already have a database. Ensure `POSTGRES_URL` in `.env` is correct, then run migrations only:

```bash
bun run --filter @fluxo/db db:migrate
```

</details>

<details>
<summary><strong>Migration failures</strong></summary>

See [Database migration failures](../DEPLOY.md#database-migration-failures) in DEPLOY.md. Common fix: clean orphan `plugin_id` references before FK migrations.

</details>

---

## lib.sh

**Purpose:** Shared functions sourced by other scripts — **do not run directly**.

**Provides:**

| Function                                    | Description                      |
| ------------------------------------------- | -------------------------------- |
| `log_info`, `log_ok`, `log_warn`, `log_err` | Colored log lines                |
| `prompt_default "label" "default"`          | Read input with default          |
| `prompt_secret "label"`                     | Hidden input                     |
| `confirm "question"`                        | y/N prompt                       |
| `gen_secret_hex`                            | `openssl rand -hex 32`           |
| `gen_secret_base64`                         | `openssl rand -base64 32`        |
| `repo_root`                                 | Absolute path to repository root |
| `require_root`                              | Exit if not root                 |
| `require_cmd`                               | Exit if binary missing           |

---

## systemd unit files

Templates for running Fluxo as OS services. Best for production Linux servers already using systemd.

| File                                               | Process  | Command                            |
| -------------------------------------------------- | -------- | ---------------------------------- |
| [`fluxo-api.service`](fluxo-api.service)           | API      | `node apps/api/dist/index.js`      |
| [`fluxo-frontend.service`](fluxo-frontend.service) | Frontend | `bun run start` in `apps/frontend` |

**Install:**

```bash
# Edit User=, paths, and ExecStart= first
sudo cp scripts/fluxo-api.service scripts/fluxo-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fluxo-api fluxo-frontend
```

Full guide: [DEPLOY.md — systemd](../DEPLOY.md#option-a--systemd)

---

## ecosystem.config.cjs

**Purpose:** [PM2](https://pm2.keymetrics.io/) configuration for running API + frontend without systemd.

**Usage:**

```bash
# From repo root, after build
export FLUXO_ROOT=/opt/fluxo   # optional, defaults to /opt/fluxo
pm2 start scripts/ecosystem.config.cjs
pm2 save
pm2 startup   # follow printed instructions for boot persistence
```

**Manages:**

| PM2 name         | Working dir     | Process                       |
| ---------------- | --------------- | ----------------------------- |
| `fluxo-api`      | repo root       | `node apps/api/dist/index.js` |
| `fluxo-frontend` | `apps/frontend` | `bun run start`               |

Environment variables are loaded from `{FLUXO_ROOT}/.env` at PM2 start.

Full guide: [DEPLOY.md — PM2](../DEPLOY.md#option-b--pm2-recommended-without-systemd)

---

## Related documentation

- [DEPLOY.md](../DEPLOY.md) — Docker, server, TLS, process managers, troubleshooting
- [CONTRIBUTING.md](../CONTRIBUTING.md) — local development
- [CLI](../apps/cli/) — `bun run fluxo doctor`, `plugins list`, `db migrate`
