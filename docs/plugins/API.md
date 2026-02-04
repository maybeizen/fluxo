# Fluxo Plugin API Reference

## Types (@fluxo/types)

### PluginManifest

```ts
interface PluginManifest {
    id: string
    name: string
    version: string
    type: 'gateway' | 'service'
    dependencies?: string[]
    description?: string
    author?: string
}
```

### ServicePlugin

```ts
interface ServicePlugin {
    readonly manifest: PluginManifest
    getConfigFields(): ServicePluginConfigField[]
    provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult>
    updateService?(input: UpdateServiceInput): Promise<void>
    suspendService?(externalId: string, reason?: string): Promise<void>
    resumeService?(externalId: string): Promise<void>
    deleteService?(externalId: string): Promise<void>
}
```

### ServicePluginConfigField

```ts
interface ServicePluginConfigField {
    key: string
    label: string
    type: 'number' | 'string' | 'boolean' | 'select'
    required?: boolean
    default?: unknown
    options?: { value: string | number; label: string }[]
    min?: number
    max?: number
    placeholder?: string
}
```

### ProvisionServiceInput

```ts
interface ProvisionServiceInput {
    productId: number
    productName: string
    serviceName: string
    userId: number
    pluginConfig: Record<string, unknown>
    metadata?: Record<string, unknown>
}
```

### ProvisionServiceResult

```ts
interface ProvisionServiceResult {
    externalId: string
    metadata?: Record<string, unknown>
}
```

### GatewayPlugin

```ts
interface GatewayPlugin {
    readonly manifest: PluginManifest
    getPaymentProviderKey(): string
    processPayment(
        request: GatewayPaymentRequest
    ): Promise<GatewayPaymentResult>
    handleWebhook?(
        payload: GatewayWebhookPayload
    ): Promise<{ invoiceId: number; paid: boolean } | null>
}
```

### GatewayPaymentRequest

```ts
interface GatewayPaymentRequest {
    invoiceId: number
    amount: number
    currency: string
    userId: number
    returnUrl?: string
    cancelUrl?: string
    metadata?: Record<string, unknown>
}
```

### GatewayPaymentResult

```ts
interface GatewayPaymentResult {
    redirectUrl?: string
    clientSecret?: string
    transactionId?: string
    completed?: boolean
}
```

## HTTP API (admin)

- `GET /api/v1/admin/plugins` – List plugins (manifest + enabled + configFields for service).
- `GET /api/v1/admin/plugins/:id` – Get one plugin.
- `POST /api/v1/admin/plugins/:id/enable` – Enable.
- `POST /api/v1/admin/plugins/:id/disable` – Disable.
- `GET /api/v1/admin/plugins/:id/config` – Get plugin config.
- `PATCH /api/v1/admin/plugins/:id/config` – Update plugin config (body: JSON object).

## HTTP API (public)

- `GET /api/v1/public/plugins/gateways` – List enabled gateway plugins for checkout.

## Webhooks

- `POST /api/v1/webhooks/gateway/:pluginId` – Gateway webhook. Body and headers are forwarded to the plugin’s `handleWebhook`. For Stripe (and any gateway that verifies signatures), configure this route to use `express.raw({ type: 'application/json' })` so the plugin receives the raw body string.
