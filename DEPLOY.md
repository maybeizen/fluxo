# Deployment Guide

Fluxo supports two deployment paths: **Docker Compose** (recommended for testing and small installs) and **bare-metal / VPS** with the helper scripts in `scripts/`.

## Prerequisites

- Bun 1.3.x (server installs) or Docker + Compose v2
- PostgreSQL 16+
- Redis 7+
- A `.env` file based on [.env.example](../.env.example) — **never commit `.env`**

Required variables (see `apps/api/src/utils/env.ts`):

| Variable                    | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `ENCRYPTION_KEY`            | Data encryption (32-byte hex recommended) |
| `SESSION_SECRET`            | Express session signing                   |
| `POSTGRES_URL`              | PostgreSQL connection string              |
| `REDIS_HOST` / `REDIS_PORT` | Redis                                     |
| `FRONTEND_URL` / `API_URL`  | Public URLs                               |
| `DISCORD_CLIENT_*`          | Discord OAuth                             |
| `NEXT_PUBLIC_API_URL`       | Frontend build-time API URL               |

Use `scripts/setup-env.sh` to generate secrets interactively.

---

## Docker deployment

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env — set DISCORD_*, secrets, and public URLs
```

Ensure `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` match `docker-compose.yml` defaults or your overrides.

### 2. Start the stack

```bash
docker compose up -d --build
```

Services:

| Service    | Port | Notes                                   |
| ---------- | ---- | --------------------------------------- |
| `postgres` | 5432 | Data volume `postgres_data`             |
| `redis`    | 6379 | Volume `redis_data`                     |
| `api`      | 3001 | Runs migrations on boot via `@fluxo/db` |
| `frontend` | 5000 | Next.js production server               |

### 3. Verify

```bash
docker compose ps
docker compose logs -f api
curl http://localhost:3001/health   # if health route exists
```

### 4. Reverse proxy (production)

Place **Nginx** or **Caddy** in front of the frontend (5000) and API (3001). Terminate TLS at the proxy and set:

- `FRONTEND_URL=https://panel.example.com`
- `API_URL=https://api.example.com`
- `DISCORD_REDIRECT_URI=https://api.example.com/auth/discord/callback`

Rebuild the frontend container when `NEXT_PUBLIC_API_URL` changes.

### Updates

```bash
git pull
docker compose up -d --build
```

### Backups

Back up PostgreSQL (`pg_dump`) and `.env` securely. Redis is used for sessions/cache and is typically rebuildable.

---

## Server deployment (Debian/Ubuntu)

### 1. Bootstrap

```bash
git clone https://github.com/maybeizen/fluxo.git /opt/fluxo
cd /opt/fluxo
sudo ./scripts/bootstrap.sh
```

This can install PostgreSQL, Redis, Bun, generate `.env`, create the database, run migrations, and build the monorepo.

Individual steps:

```bash
sudo ./scripts/install-deps.sh
./scripts/setup-env.sh
./scripts/setup-db.sh
bun install && bun run build
```

### 2. Systemd services

Edit paths/user in the unit templates, then:

```bash
sudo cp scripts/fluxo-api.service scripts/fluxo-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fluxo-api fluxo-frontend
sudo systemctl status fluxo-api fluxo-frontend
```

Default units assume:

- Install path: `/opt/fluxo`
- Unix user: `fluxo`
- Bun/node at `/home/fluxo/.bun/bin/`

### 3. HTTPS with Nginx (example)

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
    }
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Obtain certificates with [Certbot](https://certbot.eff.org/) or Caddy automatic HTTPS.

### Updates

```bash
cd /opt/fluxo
git pull
bun install --frozen-lockfile
bun run build
sudo systemctl restart fluxo-api fluxo-frontend
bun run --filter @fluxo/db db:migrate
```

---

## Troubleshooting

| Symptom                      | Check                                                         |
| ---------------------------- | ------------------------------------------------------------- |
| API won't start              | `.env` validation — compare with `.env.example`               |
| Frontend build fails locally | Remove `NODE_ENV=development` from `.env` during `next build` |
| Discord login fails          | `DISCORD_REDIRECT_URI` must match Discord app settings        |
| DB connection refused        | PostgreSQL running, `POSTGRES_URL` host/port                  |

Report issues on [GitHub](https://github.com/maybeizen/fluxo/issues).
