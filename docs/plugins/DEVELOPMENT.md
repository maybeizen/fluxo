# Fluxo Plugin Development Guide

## Overview

Plugins extend Fluxo without modifying core code. There are two types:

- **Gateway plugins**: Add payment methods at checkout (e.g. Stripe, PayPal).
- **Service plugins**: Provision resources when a product uses them (e.g. Pterodactyl, Proxmox).

## Plugin structure

Create a folder under `apps/api/plugins/` with this layout:

```
apps/api/plugins/
  your-plugin-id/
    plugin.json       # Manifest (required)
    backend/
      index.ts        # Backend entry (required)
    frontend/         # Optional: React components
      index.tsx
    migrations/       # Optional: SQL migrations
      0001_initial.sql
    README.md
```

## Manifest (plugin.json)

```json
{
    "id": "your-plugin-id",
    "name": "Your Plugin Name",
    "version": "1.0.0",
    "type": "gateway",
    "description": "Short description",
    "author": "You",
    "dependencies": []
}
```

- **id**: Unique slug (lowercase, hyphens). Used in URLs and DB.
- **type**: `"gateway"` or `"service"`.
- **dependencies**: Optional array of other plugin ids that must be enabled first.

## Service plugin backend

Your `backend/index.ts` must default-export an object that implements `ServicePlugin` from `@fluxo/types`:

- **manifest**: Your `PluginManifest` (match plugin.json).
- **getConfigFields()**: Return an array of `ServicePluginConfigField` (key, label, type, required, etc.) for the product form.
- **provisionService(input)**: Create the resource and return `{ externalId: string, metadata?: object }`.
- Optional: **updateService**, **suspendService**, **resumeService**, **deleteService**.

Product-specific config is in `input.pluginConfig`. Global plugin config (API keys, etc.) is in the `plugins` table; read it with `getDb()` and `plugins` table where `id = manifest.id`.

## Gateway plugin backend

Your `backend/index.ts` must default-export an object that implements `GatewayPlugin` from `@fluxo/types`:

- **manifest**: Your `PluginManifest`.
- **getPaymentProviderKey()**: Return a string stored on the invoice (e.g. `"stripe"`).
- **processPayment(request)**: Start the payment and return `GatewayPaymentResult` (e.g. `redirectUrl`, `clientSecret`, or `completed: true`).
- Optional: **handleWebhook(payload)**: Handle gateway webhooks; return `{ invoiceId, paid }` or null.

Webhook URL: `POST /api/v1/webhooks/gateway/<your-plugin-id>`.

## Frontend (optional)

- Register service config UI: `registerServicePluginConfig(pluginId, () => import('./path'))` in the app’s plugin loader.
- Register gateway checkout UI: `registerGatewayCheckout(pluginId, () => import('./path'))`.
- If you don’t register, the app uses a generic form built from `getConfigFields()` for service plugins.

## Database migrations

Place SQL files in `plugins/<id>/migrations/` (e.g. `0001_add_foo.sql`). They run at app startup in filename order. Only run once per plugin/migration (tracked in `plugin_migrations`).

## Installation

1. Add your folder under `apps/api/plugins/`.
2. Rebuild the application.
3. Enable the plugin in Admin → Plugins and set its config.

Plugins live inside the API app so they share its `node_modules` (e.g. `@fluxo/db`, `axios`, `stripe`). Override the location with `PLUGINS_DIR` if needed. Plugin backends can be `.ts` (when running with tsx/bun) or `.js` (if you compile them).
