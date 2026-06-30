# Fluxo documentation

## Deployment & operations

- [DEPLOY.md](../DEPLOY.md) — Docker Compose and bare-metal/server setup
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
