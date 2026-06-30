# Fluxo documentation

## Deployment & operations

- **[DEPLOY.md](../DEPLOY.md)** — full production guide (Docker Compose, bare-metal, TLS, troubleshooting)
    - [Architecture & requirements](../DEPLOY.md#architecture)
    - [Environment variables](../DEPLOY.md#environment-variables)
    - [Docker Compose](../DEPLOY.md#docker-compose-deployment)
    - [Server deployment](../DEPLOY.md#server-deployment-debianubuntu)
    - [Deployment scripts](../scripts/README.md)
    - [Process managers (PM2, Supervisor)](../DEPLOY.md#process-managers-without-systemd)
    - [Reverse proxy & TLS](../DEPLOY.md#reverse-proxy-and-tls)
    - [Troubleshooting](../DEPLOY.md#troubleshooting)
- **[scripts/README.md](../scripts/README.md)** — `bootstrap.sh`, `setup-env.sh`, systemd & PM2 configs
- [CONTRIBUTING.md](../CONTRIBUTING.md) — local dev and PR workflow
- [SECURITY.md](../SECURITY.md) — vulnerability reporting

## Plugin development

Plugins live under [`plugins/`](../plugins/) and implement contracts from `@fluxo/forge`.

| Plugin          | Type    | Docs                                                                      |
| --------------- | ------- | ------------------------------------------------------------------------- |
| example-service | Server  | [plugins/example-service/README.md](../plugins/example-service/README.md) |
| example-gateway | Gateway | [plugins/example-gateway/README.md](../plugins/example-gateway/README.md) |
| example-theme   | Theme   | [plugins/example-theme/README.md](../plugins/example-theme/README.md)     |
| proxmox         | Server  | [plugins/proxmox/README.md](../plugins/proxmox/README.md)                 |

### SDK reference

- `@fluxo/forge` — `FluxoServerPlugin`, `FluxoGatewayPlugin`, `FluxoThemePlugin`, manifest schema
- `@fluxo/plugin-manager` — discovery, enable/disable, migrations

Enable plugins from **Admin → Plugins** after placing them in `plugins/` (or `PLUGINS_DIR`).
