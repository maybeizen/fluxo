# Fluxo Deployment Guide

Complete reference for deploying Fluxo in production using **Docker Compose** or a **bare-metal / VPS** install.

| Path                                                           | Best for                                                   |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| [Docker Compose](#docker-compose-deployment)                   | Quick start, homelab, staging, small production            |
| [Server + systemd](#option-a--systemd)                         | Standard Linux VPS with OS service management              |
| [Server + PM2 / Supervisor](#process-managers-without-systemd) | No systemd, Node-friendly process managers, shared hosting |

---

## Table of contents

1. [Architecture](#architecture)
2. [Before you deploy](#before-you-deploy)
3. [Environment variables](#environment-variables)
4. [Docker Compose deployment](#docker-compose-deployment)
5. [Server deployment (Debian/Ubuntu)](#server-deployment-debianubuntu)
6. [Deployment scripts reference](#deployment-scripts-reference)
7. [Process managers (without systemd)](#process-managers-without-systemd)
8. [Post-deploy configuration](#post-deploy-configuration)
9. [Reverse proxy and TLS](#reverse-proxy-and-tls)
10. [Operations](#operations)
11. [Security checklist](#security-checklist)
12. [Troubleshooting](#troubleshooting)

---

## Architecture

Fluxo is a monorepo with two runtime processes plus two data stores:

```mermaid
flowchart TB
    subgraph clients [Clients]
        Browser[Browser]
    end

    subgraph proxy [Reverse proxy optional]
        Nginx[Nginx or Caddy]
    end

    subgraph app [Application]
        FE[Frontend Next.js :5000]
        API[API Express :5001]
    end

    subgraph data [Data]
        PG[(PostgreSQL 16)]
        RD[(Redis 7)]
    end

    Browser --> Nginx
    Nginx --> FE
    Nginx --> API
    FE -->|NEXT_PUBLIC_API_URL| API
    API --> PG
    API --> RD
    API --> Plugins[plugins/ directory]
```

| Component  | Default port | Role                                        |
| ---------- | ------------ | ------------------------------------------- |
| Frontend   | `5000`       | Next.js UI (client + admin)                 |
| API        | `5001`       | REST API, WebSockets, webhooks, plugin host |
| PostgreSQL | `5432`       | Primary data store                          |
| Redis      | `6379`       | Sessions, cache, rate limits, workers       |

**Health check:** `GET {API_URL}/api/v1/health` → `{ "success": true, "message": "Service is healthy" }`

---

## Before you deploy

### Minimum requirements

| Resource | Docker                             | Server                    |
| -------- | ---------------------------------- | ------------------------- |
| CPU      | 2 vCPU                             | 2 vCPU                    |
| RAM      | 2 GB                               | 2 GB (4 GB recommended)   |
| Disk     | 10 GB                              | 10 GB + Postgres growth   |
| OS       | Linux with Docker 24+ & Compose v2 | Debian 12 / Ubuntu 22.04+ |

### Software versions

- **Bun** `1.3.x` (server installs and Docker images)
- **PostgreSQL** `16+`
- **Redis** `7+`
- **Node.js** `20 LTS` (optional on server; Bun runs the apps)

### Pre-flight checklist

- [ ] Domain(s) or IP ready for panel and API (same host or split)
- [ ] DNS A/AAAA records point to your server
- [ ] Firewall allows `80`/`443` (and blocks public `5432`/`6379` unless intentional)
- [ ] Discord application created at [Discord Developer Portal](https://discord.com/developers/applications) (OAuth)
- [ ] `.env` prepared — **never commit `.env`** (see [`.env.example`](.env.example))
- [ ] Secrets generated (`ENCRYPTION_KEY`, `SESSION_SECRET`, DB password)

<details>
<summary><strong>Generate secrets manually (without scripts)</strong></summary>

```bash
# 32-byte hex encryption key
openssl rand -hex 32

# Session secret (base64)
openssl rand -base64 32

# Database password
openssl rand -base64 24 | tr -d '/+=' | head -c 32
```

Store these in a password manager. **Rotating `ENCRYPTION_KEY` after data is encrypted will break decryption of stored secrets** (Discord tokens, SMTP passwords, gateway keys).

</details>

---

## Environment variables

All variables are validated at API startup ([`apps/api/src/utils/env.ts`](apps/api/src/utils/env.ts)). The frontend reads `NEXT_PUBLIC_API_URL` at **build time** (Docker) or from root `.env` during `next build` (server).

### Required

| Variable                | Example                                           | Notes                                                                                   |
| ----------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `NODE_ENV`              | `production`                                      | Use `production` in prod. **Do not leave `development` in `.env` during `next build`.** |
| `PORT`                  | `5001`                                            | API listen port                                                                         |
| `FRONTEND_URL`          | `https://panel.example.com`                       | Public panel URL (CORS, cookies, WebSockets)                                            |
| `API_URL`               | `https://api.example.com`                         | Public API base URL **without** `/api/v1`                                               |
| `APP_NAME`              | `My Host`                                         | Shown in UI and emails                                                                  |
| `ENCRYPTION_KEY`        | `64-char hex`                                     | 32-byte key; use `openssl rand -hex 32`                                                 |
| `SESSION_SECRET`        | random string                                     | Session cookie signing                                                                  |
| `SESSION_LIFETIME`      | `604800`                                          | Seconds (default 7 days)                                                                |
| `BCRYPT_ROUNDS`         | `10`                                              | Password hashing cost                                                                   |
| `POSTGRES_URL`          | `postgresql://user:pass@host:5432/fluxo`          | Full connection string                                                                  |
| `REDIS_HOST`            | `127.0.0.1` or `redis`                            | Docker Compose: use service name `redis`                                                |
| `REDIS_PORT`            | `6379`                                            |                                                                                         |
| `REDIS_PASSWORD`        | `null`                                            | Literal string `null` when no password                                                  |
| `DISCORD_CLIENT_ID`     |                                                   | From Discord Developer Portal                                                           |
| `DISCORD_CLIENT_SECRET` |                                                   |                                                                                         |
| `DISCORD_REDIRECT_URI`  | `https://api.example.com/api/v1/discord/callback` | Must match Discord app **exactly**                                                      |
| `NEXT_PUBLIC_API_URL`   | `https://api.example.com/api/v1`                  | **Must include `/api/v1`** — baked into frontend build                                  |

### Docker Compose database vars

When using [`docker-compose.yml`](docker-compose.yml), also set (or accept defaults):

| Variable            | Default | Purpose                     |
| ------------------- | ------- | --------------------------- |
| `POSTGRES_USER`     | `fluxo` | Postgres container user     |
| `POSTGRES_PASSWORD` | `fluxo` | Postgres container password |
| `POSTGRES_DB`       | `fluxo` | Database name               |

`POSTGRES_URL` in `.env` must use the same credentials. Compose overrides `POSTGRES_URL` for the API container to `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}`.

### Optional

| Variable                | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `COOKIE_DOMAIN`         | e.g. `.example.com` when panel and API share parent domain |
| `SMTP_*` / `EMAIL_FROM` | Outbound email (or configure in Admin → SMTP)              |
| `PLUGINS_DIR`           | Override plugin directory (default: repo `plugins/`)       |
| `APP_THEME_COLOR`       | Email CTA color if not loaded from DB settings             |

<details>
<summary><strong>URL configuration examples (single domain vs split)</strong></summary>

**Split domains (recommended for production)**

```env
FRONTEND_URL=https://panel.example.com
API_URL=https://api.example.com
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
DISCORD_REDIRECT_URI=https://api.example.com/api/v1/discord/callback
# COOKIE_DOMAIN=.example.com
```

**Same host, path-based routing (advanced)**

If you proxy `/api` on the same domain as the panel, set URLs to that host and configure Nginx/Caddy path rules. WebSocket upgrades must be forwarded for tickets.

**Local / staging**

```env
FRONTEND_URL=http://localhost:5000
API_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
DISCORD_REDIRECT_URI=http://localhost:5001/api/v1/discord/callback
```

</details>

<details>
<summary><strong>Interactive .env generation</strong></summary>

```bash
./scripts/setup-env.sh
```

Creates root `.env` with prompts and optional auto-generated secrets. Re-run only on fresh installs — overwriting resets secrets and may desync the database password.

</details>

---

## Docker Compose deployment

### Step 1 — Clone and configure

```bash
git clone https://github.com/maybeizen/fluxo.git
cd fluxo
cp .env.example .env
```

Edit `.env`:

1. Set strong `ENCRYPTION_KEY`, `SESSION_SECRET`
2. Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (match what you want in Postgres)
3. Set public URLs when not testing locally
4. Set `NEXT_PUBLIC_API_URL` to `{API_URL}/api/v1`
5. Set `DISCORD_REDIRECT_URI` to `{API_URL}/api/v1/discord/callback`

<details>
<summary><strong>Production .env snippet (Docker)</strong></summary>

```env
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://panel.example.com
API_URL=https://api.example.com
APP_NAME=My Host

ENCRYPTION_KEY=<openssl rand -hex 32>
SESSION_SECRET=<openssl rand -base64 32>
SESSION_LIFETIME=604800
BCRYPT_ROUNDS=10

POSTGRES_USER=fluxo
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=fluxo
POSTGRES_URL=postgresql://fluxo:<strong-password>@postgres:5432/fluxo

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=null

DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
DISCORD_REDIRECT_URI=https://api.example.com/api/v1/discord/callback

NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
```

</details>

### Step 2 — Build and start

```bash
docker compose up -d --build
```

First boot may take several minutes (monorepo build). The API waits for Postgres and Redis healthchecks, then runs migrations automatically via `@fluxo/db` on connect.

### Step 3 — Verify services

```bash
docker compose ps
docker compose logs -f api
curl -s http://localhost:5001/api/v1/health | jq
curl -sI http://localhost:5000 | head -5
```

| Service    | Internal | Host port       |
| ---------- | -------- | --------------- |
| `postgres` | `5432`   | `5432`          |
| `redis`    | `6379`   | `6379`          |
| `api`      | `5001`   | `${PORT:-5001}` |
| `frontend` | `5000`   | `5000`          |

<details>
<summary><strong>Container keeps restarting</strong></summary>

```bash
docker compose logs api --tail 100
docker compose logs frontend --tail 100
```

Common causes:

| Log message                                    | Fix                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `Environment variables are missing or invalid` | Compare `.env` with [`.env.example`](.env.example); check Discord URLs are valid         |
| `connect ECONNREFUSED postgres`                | Wait for Postgres healthcheck; verify `POSTGRES_URL` uses host `postgres` inside Compose |
| `Redis connection failed`                      | Ensure `REDIS_HOST=redis` in `.env` for Compose                                          |
| Migration errors / FK violations               | See [Database migration failures](#database-migration-failures)                          |

</details>

<details>
<summary><strong>Port already in use</strong></summary>

Change host mappings in `docker-compose.yml` or stop conflicting services:

```bash
sudo ss -tlnp | grep -E ':5000|:5001|:5432|:6379'
```

Example: map frontend to host `8080`:

```yaml
ports:
    - '8080:5000'
```

</details>

<details>
<summary><strong>Rebuild after changing NEXT_PUBLIC_API_URL</strong></summary>

`NEXT_PUBLIC_API_URL` is a **build argument** for the frontend image. After changing it:

```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

Changing only `.env` without rebuilding leaves the old API URL baked into the client bundle.

</details>

### Step 4 — Production hardening (Docker)

- Do **not** expose `5432`/`6379` publicly — remove `ports:` for Postgres/Redis in production or bind to `127.0.0.1`
- Put [Nginx or Caddy](#reverse-proxy-and-tls) in front of `5000` and `5001`
- Use named volumes (`postgres_data`, `redis_data`) — back up Postgres regularly

---

## Server deployment (Debian/Ubuntu)

For VPS or dedicated servers without Docker. Helper scripts live in [`scripts/`](scripts/) — see [Deployment scripts reference](#deployment-scripts-reference) for full documentation of each script.

Scripts target **Debian 12 / Ubuntu 22.04+**.

### Step 1 — Create system user (recommended)

```bash
sudo useradd -r -m -s /bin/bash fluxo
sudo usermod -aG sudo fluxo   # optional, for admin tasks
```

### Step 2 — Clone repository

```bash
sudo mkdir -p /opt/fluxo
sudo chown fluxo:fluxo /opt/fluxo
sudo -u fluxo git clone https://github.com/maybeizen/fluxo.git /opt/fluxo
cd /opt/fluxo
```

### Step 3 — Bootstrap (all-in-one)

```bash
sudo ./scripts/bootstrap.sh
```

This optionally:

1. Installs PostgreSQL, Redis, Bun, Node 20 (`install-deps.sh`)
2. Generates `.env` (`setup-env.sh`)
3. Creates DB role/database and runs migrations (`setup-db.sh`)
4. Runs `bun install --frozen-lockfile` and `bun run build`

<details>
<summary><strong>Run steps individually</strong></summary>

```bash
# 1. System packages (root)
sudo ./scripts/install-deps.sh

# 2. Environment file (as fluxo user)
./scripts/setup-env.sh

# 3. Database + migrations
./scripts/setup-db.sh

# 4. Install and build
bun install --frozen-lockfile
export CI=true
set -a && source .env && set +a
bun run build
```

</details>

<details>
<summary><strong>install-deps.sh fails or Bun not in PATH</strong></summary>

Bun installs to `~/.bun/bin`. After install:

```bash
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
bun --version
```

If running as `fluxo`, use `/home/fluxo/.bun/bin/bun` in systemd units.

</details>

### Step 4 — Run Fluxo (choose a process manager)

After bootstrap/build, keep API and frontend running in production. Pick one:

| Option                                                                    | Best for                                       |
| ------------------------------------------------------------------------- | ---------------------------------------------- |
| [systemd](#option-a--systemd)                                             | Default on Debian/Ubuntu VPS                   |
| [PM2](#option-b--pm2-recommended-without-systemd)                         | No systemd, familiar Node ecosystem, easy logs |
| [Supervisor](#option-c--supervisor)                                       | Python-based alternative to systemd            |
| [Foreground / screen](#option-d--foreground-or-screen-not-for-production) | Quick tests only — **not production**          |

#### Option A — systemd

Edit [`scripts/fluxo-api.service`](scripts/fluxo-api.service) and [`scripts/fluxo-frontend.service`](scripts/fluxo-frontend.service):

| Setting            | Default                         | Change to             |
| ------------------ | ------------------------------- | --------------------- |
| `User` / `Group`   | `fluxo`                         | Your deploy user      |
| `WorkingDirectory` | `/opt/fluxo`                    | Install path          |
| `EnvironmentFile`  | `/opt/fluxo/.env`               | Path to `.env`        |
| `ExecStart` (API)  | `/home/fluxo/.bun/bin/node ...` | Correct bun/node path |

Install and start:

```bash
sudo cp scripts/fluxo-api.service scripts/fluxo-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable fluxo-api fluxo-frontend
sudo systemctl start fluxo-api fluxo-frontend
sudo systemctl status fluxo-api fluxo-frontend
```

<details>
<summary><strong>systemd service fails immediately</strong></summary>

```bash
sudo journalctl -u fluxo-api -n 50 --no-pager
sudo journalctl -u fluxo-frontend -n 50 --no-pager
```

| Symptom                                  | Fix                                                                |
| ---------------------------------------- | ------------------------------------------------------------------ |
| `No such file or directory` on ExecStart | Fix Bun/Node path; run `which bun` as deploy user                  |
| `Environment variables are missing`      | Check `EnvironmentFile=` path and `.env` permissions (`chmod 600`) |
| `dist/index.js` not found                | Run `bun run build` from repo root as deploy user                  |
| Frontend exits                           | Ensure `apps/frontend/.next` exists from successful `next build`   |
| Permission denied on `.env`              | `chown fluxo:fluxo /opt/fluxo/.env`                                |

</details>

### Step 5 — Verify

```bash
curl -s http://127.0.0.1:5001/api/v1/health
curl -sI http://127.0.0.1:5000 | head -5
```

---

## Deployment scripts reference

All bare-metal helpers are in [`scripts/`](scripts/). Full per-script documentation: **[scripts/README.md](scripts/README.md)**.

| Script                   | Run as           | Summary                                        |
| ------------------------ | ---------------- | ---------------------------------------------- |
| `bootstrap.sh`           | `sudo` (partial) | Orchestrates deps → env → db → install → build |
| `install-deps.sh`        | `sudo`           | apt: PostgreSQL, Redis, Bun, Node 20           |
| `setup-env.sh`           | deploy user      | Interactive `.env` + secret generation         |
| `setup-db.sh`            | deploy user      | Postgres role/DB + `db:migrate`                |
| `lib.sh`                 | —                | Shared helpers (not executed directly)         |
| `fluxo-api.service`      | —                | systemd unit template                          |
| `fluxo-frontend.service` | —                | systemd unit template                          |
| `ecosystem.config.cjs`   | deploy user      | PM2 config for API + frontend                  |

```bash
# Typical first install
sudo ./scripts/bootstrap.sh
# Then systemd OR pm2 (see below)
```

---

## Process managers (without systemd)

Use these when you **don't** want OS-level systemd units — e.g. shared VPS, macOS, WSL, or you prefer Node tooling for restarts and logs.

### Option B — PM2 (recommended without systemd)

[PM2](https://pm2.keymetrics.io/) keeps both processes alive, aggregates logs, and can start on boot.

**Install PM2:**

```bash
npm install -g pm2
# or: bun install -g pm2
```

**Start Fluxo** (after `bun run build`):

```bash
cd /opt/fluxo
export FLUXO_ROOT=/opt/fluxo          # install path
export FLUXO_BUN=/home/fluxo/.bun/bin/bun   # optional, if bun not in PATH
export FLUXO_NODE=/home/fluxo/.bun/bin/node # optional

pm2 start scripts/ecosystem.config.cjs
pm2 status
pm2 logs fluxo-api
```

**Persist across reboots:**

```bash
pm2 save
pm2 startup
# Run the command PM2 prints (usually a sudo env ... line)
```

**Updates:**

```bash
cd /opt/fluxo
git pull && bun install --frozen-lockfile && bun run build
bun run --filter @fluxo/db db:migrate
pm2 restart all
```

<details>
<summary><strong>PM2 troubleshooting</strong></summary>

| Issue                           | Fix                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| `fluxo-api` errored immediately | `pm2 logs fluxo-api --lines 50` — usually missing `.env` or failed build                 |
| `.env` not loaded               | Set `FLUXO_ROOT` to repo root; ensure `.env` exists there                                |
| `bun: command not found`        | Set `FLUXO_BUN` to full path in ecosystem or shell profile                               |
| Frontend 404 / wrong API        | Rebuild frontend after changing `NEXT_PUBLIC_API_URL`, then `pm2 restart fluxo-frontend` |
| Boot persistence missing        | Re-run `pm2 save` and `pm2 startup` after OS upgrade                                     |

</details>

### Option C — Supervisor

[Supervisor](http://supervisord.org/) is a common alternative on systems without systemd or when you already use it for other apps.

**Install:**

```bash
sudo apt-get install supervisor
```

**Create `/etc/supervisor/conf.d/fluxo.conf`:**

```ini
[program:fluxo-api]
command=/home/fluxo/.bun/bin/node /opt/fluxo/apps/api/dist/index.js
directory=/opt/fluxo
user=fluxo
autostart=true
autorestart=true
environment=NODE_ENV="production"
stdout_logfile=/var/log/fluxo/api.log
stderr_logfile=/var/log/fluxo/api.err.log

[program:fluxo-frontend]
command=/home/fluxo/.bun/bin/bun run start
directory=/opt/fluxo/apps/frontend
user=fluxo
autostart=true
autorestart=true
environment=NODE_ENV="production"
stdout_logfile=/var/log/fluxo/frontend.log
stderr_logfile=/var/log/fluxo/frontend.err.log
```

Supervisor does not load `.env` automatically. Either:

- Export variables in `environment=` (comma-separated), or
- Wrap with a shell: `command=/bin/bash -c 'set -a && source /opt/fluxo/.env && set +a && exec node ...'`

```bash
sudo mkdir -p /var/log/fluxo
sudo chown fluxo:fluxo /var/log/fluxo
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

<details>
<summary><strong>Supervisor troubleshooting</strong></summary>

- **`FATAL Exited too quickly`** — run the `command=` manually as the `fluxo` user to see stderr
- **Missing env vars** — use the bash wrapper with `source .env` shown above
- **Permission denied on .env** — `chmod 600` and correct owner

</details>

### Option D — Foreground or screen (not for production)

For local staging or a quick smoke test only:

```bash
# Terminal 1 — API
cd /opt/fluxo
set -a && source .env && set +a
node apps/api/dist/index.js

# Terminal 2 — frontend
cd /opt/fluxo/apps/frontend
set -a && source ../../.env && set +a
bun run start
```

[`screen`](https://www.gnu.org/software/screen/) or [`tmux`](https://github.com/tmux/tmux/wiki) can detach these sessions, but there is **no automatic restart** on crash or reboot. Use systemd or PM2 for production.

<details>
<summary><strong>Comparison: systemd vs PM2 vs Supervisor</strong></summary>

| Feature          | systemd            | PM2                        | Supervisor              |
| ---------------- | ------------------ | -------------------------- | ----------------------- |
| Boot persistence | native             | `pm2 startup`              | native                  |
| Auto-restart     | yes                | yes                        | yes                     |
| Log aggregation  | journalctl         | `pm2 logs`                 | log files               |
| `.env` loading   | `EnvironmentFile=` | via `ecosystem.config.cjs` | manual / wrapper        |
| Best on          | Linux VPS          | Node-heavy stacks          | mixed Python/Node shops |

</details>

---

## Post-deploy configuration

### 1. Create admin user

Register the first account via the panel, then promote in PostgreSQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

<details>
<summary><strong>Cannot register / auth errors</strong></summary>

- Confirm `FRONTEND_URL` matches the URL in your browser
- Check API logs for validation errors
- Ensure `NEXT_PUBLIC_API_URL` ends with `/api/v1` and matches how the browser calls the API
- If using HTTPS behind a proxy, set `app.set('trust proxy', 1)` (already enabled) and forward `X-Forwarded-*` headers

</details>

### 2. Discord OAuth

1. [Discord Developer Portal](https://discord.com/developers/applications) → your app → **OAuth2**
2. Add redirect URL: `{API_URL}/api/v1/discord/callback`
3. Copy Client ID and Secret into Admin → Settings → Integrations (or `.env`)
4. Ensure `DISCORD_REDIRECT_URI` in `.env` matches **exactly** (including `https`, no trailing slash)

<details>
<summary><strong>Discord redirect_uri mismatch</strong></summary>

- Discord error `redirect_uri OAuth2 error`: URL in Discord app must match `DISCORD_REDIRECT_URI` byte-for-byte
- Common mistake: using `/auth/discord/callback` — correct path is **`/api/v1/discord/callback`**
- After changing redirect URI, restart API: `docker compose restart api`, `sudo systemctl restart fluxo-api`, or `pm2 restart fluxo-api`

</details>

### 3. SMTP email (optional)

Configure in **Admin → Settings → SMTP** or via `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`).

<details>
<summary><strong>Emails not sending</strong></summary>

- Test SMTP credentials with an external client first
- Check API logs for Nodemailer errors
- Verify firewall allows outbound port 587/465
- Ensure `EMAIL_FROM` is allowed by your provider

</details>

### 4. Payment gateways (Stripe)

1. Enable **stripe-gateway** plugin in Admin → Plugins
2. Enter Stripe secret key and webhook secret in plugin settings
3. Configure Stripe webhook endpoint: `{API_URL}/api/v1/webhooks/gateway/stripe-gateway`
4. Stripe requires **raw JSON body** — do not put another JSON parser in front of this path

<details>
<summary><strong>Payments stuck / webhooks not firing</strong></summary>

- Confirm webhook URL in Stripe dashboard matches plugin ID (`stripe-gateway`)
- Check API logs for signature verification failures
- Ensure reverse proxy forwards raw body (no `sub_filter` on webhook path)
- Test: `curl -X POST {API_URL}/api/v1/webhooks/gateway/stripe-gateway` should return non-404

</details>

### 5. Plugins

Plugins live in [`plugins/`](plugins/) (or `PLUGINS_DIR`). Enable from **Admin → Plugins**. Server/gateway plugins may need configuration before provisioning works.

<details>
<summary><strong>Plugin not appearing or fails to load</strong></summary>

- Verify `plugin.json` and `backend/index.ts` exist
- Check API startup logs for plugin manager errors
- Ensure plugin is enabled in DB (`plugins` table)
- Run `bun run fluxo plugins list` from repo root (CLI)

</details>

---

## Reverse proxy and TLS

Production should terminate TLS at **Nginx** or **Caddy**. Never expose plain HTTP to the public internet.

### Nginx example (split domains)

**Panel** — `panel.example.com` → `127.0.0.1:5000`

```nginx
server {
    listen 443 ssl http2;
    server_name panel.example.com;

    ssl_certificate     /etc/letsencrypt/live/panel.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/panel.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**API** — `api.example.com` → `127.0.0.1:5001`

```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 25M;
    }
}
```

Obtain certificates with [Certbot](https://certbot.eff.org/):

```bash
sudo certbot --nginx -d panel.example.com -d api.example.com
```

After TLS is live, update `.env` with `https://` URLs and rebuild/restart (see [Rebuild after changing NEXT_PUBLIC_API_URL](#step-4--production-hardening-docker)).

<details>
<summary><strong>Caddy example (automatic HTTPS)</strong></summary>

```caddy
panel.example.com {
    reverse_proxy localhost:5000
}

api.example.com {
    reverse_proxy localhost:5001
}
```

Caddy obtains and renews certificates automatically. Reload after editing: `sudo systemctl reload caddy`.

</details>

<details>
<summary><strong>WebSocket / ticket chat not connecting</strong></summary>

- Nginx must pass `Upgrade` and `Connection` headers (see examples above)
- `FRONTEND_URL` must match the browser origin exactly (scheme + host + port)
- Check browser devtools → Network → WS for failed handshake
- If using Cloudflare, enable WebSockets on the domain

</details>

---

## Operations

### Updates

**Docker:**

```bash
cd /path/to/fluxo
git pull
docker compose up -d --build
```

**Server (systemd):**

```bash
cd /opt/fluxo
git pull
bun install --frozen-lockfile
export CI=true
set -a && source .env && set +a
bun run build
bun run --filter @fluxo/db db:migrate
sudo systemctl restart fluxo-api fluxo-frontend
```

**Server (PM2):**

```bash
cd /opt/fluxo
git pull && bun install --frozen-lockfile && bun run build
bun run --filter @fluxo/db db:migrate
pm2 restart all
```

<details>
<summary><strong>Safe update checklist</strong></summary>

1. Back up PostgreSQL (see below)
2. Read release notes / migration changes
3. Put panel in maintenance mode if you add one (optional)
4. Pull, build, migrate, restart
5. Verify `/api/v1/health` and login flow
6. Check `docker compose logs`, `journalctl`, or `pm2 logs` for errors

</details>

### Database migrations

Migrations run automatically on API boot. Manual run:

```bash
bun run --filter @fluxo/db db:migrate
```

<details>
<summary><strong>Database migration failures</strong></summary>

- **FK constraint errors on migration 0006:** orphan `plugin_id` references in `product_integrations` — clean data or insert stub rows in `plugins` table before migrating
- **`use_value_as_multiplier` type change:** ensure migration `0006` includes `DROP DEFAULT` before column type change (fixed in current repo)
- **Permission denied:** DB user needs `CREATE`, `ALTER` on the database
- Always back up before migrating production

</details>

### Backups

**PostgreSQL:**

```bash
# Docker
docker compose exec postgres pg_dump -U fluxo fluxo > fluxo-$(date +%F).sql

# Server
pg_dump "$POSTGRES_URL" > fluxo-$(date +%F).sql
```

**Restore:**

```bash
psql "$POSTGRES_URL" < fluxo-2026-06-30.sql
```

Also back up securely:

- `.env` (secrets)
- `plugins/` custom configs if modified
- Uploaded files under `apps/api/src/uploads/` (if used)

Redis holds sessions and cache — usually rebuildable; backing up is optional.

<details>
<summary><strong>Disaster recovery</strong></summary>

1. Restore Postgres dump to a fresh database
2. Restore `.env` with **same** `ENCRYPTION_KEY` and `SESSION_SECRET` (or users must re-login and encrypted fields break)
3. Redeploy application (`docker compose up -d --build` or systemd restart)
4. Verify health, login, and one billing flow

</details>

### Rollback

```bash
git checkout <previous-tag-or-commit>
# Docker
docker compose up -d --build
# Server
bun install --frozen-lockfile && bun run build && sudo systemctl restart fluxo-api fluxo-frontend
```

If a migration is irreversible, restore from the pre-update `pg_dump` instead.

### Monitoring

| Check         | Command                                                      |
| ------------- | ------------------------------------------------------------ |
| API health    | `curl -sf {API_URL}/api/v1/health`                           |
| Docker status | `docker compose ps`                                          |
| systemd       | `systemctl status fluxo-api fluxo-frontend`                  |
| API logs      | `docker compose logs -f api` or `journalctl -u fluxo-api -f` |
| Disk          | `df -h`; Postgres volume growth                              |

Consider uptime monitoring on `/api/v1/health` and your panel homepage.

---

## Security checklist

- [ ] `.env` mode `600`, owned by deploy user, not in git
- [ ] Strong unique secrets for `ENCRYPTION_KEY`, `SESSION_SECRET`, DB password
- [ ] TLS on all public endpoints
- [ ] Postgres and Redis not exposed to the internet
- [ ] Firewall (`ufw`/`nftables`) allows only required ports
- [ ] `NODE_ENV=production` in production
- [ ] Discord/Stripe secrets only in `.env` or encrypted admin settings
- [ ] Regular OS and dependency updates (`dependabot` on GitHub)
- [ ] Report vulnerabilities per [SECURITY.md](SECURITY.md)

---

## Troubleshooting

Quick reference — expand sections for details.

| Symptom                 | Section                                                                      |
| ----------------------- | ---------------------------------------------------------------------------- |
| API won't start         | [API startup failures](#api-startup-failures)                                |
| Frontend build fails    | [Frontend build failures](#frontend-build-failures)                          |
| 404 on API from browser | [API URL / NEXT_PUBLIC_API_URL](#api-url--next_public_api_url-mismatch)      |
| Discord login broken    | [Discord redirect_uri mismatch](#discord-redirect_uri-mismatch)              |
| DB connection refused   | [Database connection issues](#database-connection-issues)                    |
| Redis errors            | [Redis connection issues](#redis-connection-issues)                          |
| Stripe webhooks         | [Payments stuck / webhooks not firing](#payments-stuck--webhooks-not-firing) |
| Migrations fail         | [Database migration failures](#database-migration-failures)                  |

<details>
<summary><strong>API startup failures</strong></summary>

```bash
# Docker
docker compose logs api --tail 200

# Server
sudo journalctl -u fluxo-api -n 200 --no-pager
```

| Error                                          | Solution                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Environment variables are missing or invalid` | Fix `.env`; every required field in [Environment variables](#environment-variables) |
| Invalid URL for `FRONTEND_URL` / `API_URL`     | Must include scheme (`https://`)                                                    |
| `ECONNREFUSED` Postgres/Redis                  | Service down or wrong host in `.env`                                                |
| Plugin load error                              | Disable problematic plugin in DB or fix `plugins/`                                  |

</details>

<details>
<summary><strong>Frontend build failures</strong></summary>

**Symptom:** `next build` fails with React/context/prerender errors or wrong environment.

**Cause:** Root `.env` sets `NODE_ENV=development`, which Next.js reads during build.

**Fix:** [`next.config.ts`](apps/frontend/next.config.ts) preserves build-time `NODE_ENV`, but safest practice:

```bash
# Server build
export CI=true
grep -v '^NODE_ENV=' .env > .env.build   # optional: use production-only env
set -a && source .env && set +a
bun run --filter @fluxo/frontend build
```

For Docker, the Dockerfile sets `CI=true` and does not copy `.env` into the build stage.

</details>

<details>
<summary><strong>API URL / NEXT_PUBLIC_API_URL mismatch</strong></summary>

**Symptom:** Login/register returns 404; network tab shows requests to wrong host or missing `/api/v1`.

**Fix:**

```env
API_URL=https://api.example.com
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1
```

- `API_URL` — no trailing path
- `NEXT_PUBLIC_API_URL` — **must** end with `/api/v1`

After changing: rebuild frontend (Docker `--no-cache frontend` or `bun run build` on server).

</details>

<details>
<summary><strong>Database connection issues</strong></summary>

```bash
# Test connection
psql "$POSTGRES_URL" -c 'SELECT 1'

# Docker: shell into postgres
docker compose exec postgres psql -U fluxo -d fluxo -c 'SELECT 1'
```

| Issue                               | Fix                                                     |
| ----------------------------------- | ------------------------------------------------------- |
| `connection refused`                | Postgres not running; wrong host/port                   |
| `password authentication failed`    | `POSTGRES_URL` password ≠ Postgres role password        |
| Docker: works on host, fails in API | Use `@postgres:5432` in API container, not `@localhost` |
| `too many connections`              | Tune Postgres `max_connections` or reduce pool size     |

</details>

<details>
<summary><strong>Redis connection issues</strong></summary>

```bash
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping
# Docker
docker compose exec redis redis-cli ping
```

- Docker Compose: `REDIS_HOST=redis`
- Server: `REDIS_HOST=127.0.0.1`
- If Redis has a password, set `REDIS_PASSWORD` (not the literal string `null`)

</details>

<details>
<summary><strong>CORS or cookie / session issues</strong></summary>

- `FRONTEND_URL` must exactly match browser address (including `https` and port)
- For subdomains, set `COOKIE_DOMAIN=.example.com`
- Behind proxy: ensure `X-Forwarded-Proto: https` is sent
- Clear browser cookies after URL changes
- Sessions live in Redis — flushing Redis logs everyone out

</details>

<details>
<summary><strong>CLI helpers</strong></summary>

From repo root:

```bash
bun run fluxo doctor          # environment checks
bun run fluxo plugins list    # installed plugins
bun run fluxo status          # service status (where configured)
bun run --filter @fluxo/db db:migrate
```

</details>

---

## Getting help

- [GitHub Issues](https://github.com/maybeizen/fluxo/issues) — bugs and feature requests
- [SECURITY.md](SECURITY.md) — responsible disclosure
- [CONTRIBUTING.md](CONTRIBUTING.md) — development setup
- [docs/plugins/](docs/plugins/) — plugin development

When filing deployment issues, include: deployment path (Docker/server), OS version, relevant logs (redact secrets), and sanitized `.env` **keys only** (not values).
