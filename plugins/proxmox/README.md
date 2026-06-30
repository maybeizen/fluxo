# Proxmox Plugin

> **Status: stub** — provisions a mock external ID only. No Proxmox API calls are made yet.

Use `plugins/example-service` as a reference for a full service plugin implementation.

When implementing real provisioning, use `ctx.http` against the configured `apiUrl` and add the Proxmox host to `PLUGIN_HTTP_ALLOWLIST` if it resolves to a private IP.
