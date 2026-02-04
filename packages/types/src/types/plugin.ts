/**
 * Plugin type discriminator.
 */
export type PluginType = 'gateway' | 'service'

/**
 * Plugin manifest (plugin.json). Defines metadata and capabilities.
 */
export interface PluginManifest {
    /** Unique plugin identifier (e.g. "pterodactyl", "stripe-gateway") */
    id: string
    /** Human-readable name */
    name: string
    /** Semantic version */
    version: string
    /** Plugin type */
    type: PluginType
    /** Optional list of plugin IDs this plugin depends on */
    dependencies?: string[]
    /** Optional description */
    description?: string
    /** Optional author */
    author?: string
    /** If true, plugin ships with the app; otherwise considered user-installed */
    shipped?: boolean
}

/**
 * Configuration field definition for service plugins (product/service config UI).
 */
export interface ServicePluginConfigField {
    key: string
    label: string
    type: 'number' | 'string' | 'boolean' | 'select'
    required?: boolean
    default?: unknown
    /** For type 'select', options as { value, label }. Or omit and set dynamicOptions: true to fetch from plugin. */
    options?: { value: string | number; label: string }[]
    /** When true, options are fetched from the plugin via getFieldOptions (e.g. nodes, eggs from panel API). */
    dynamicOptions?: boolean
    min?: number
    max?: number
    placeholder?: string
}

/** Option item returned by getFieldOptions. */
export interface PluginFieldOption {
    value: string | number
    label: string
}

/** Issue reported by a plugin (e.g. missing config, API unreachable). */
export interface PluginIssue {
    message: string
    severity: 'error' | 'warning' | 'info'
    details?: string
}

/**
 * Plugin settings field (plugin's own config in admin). Extends ServicePluginConfigField with optional secret.
 */
export interface PluginSettingsField extends ServicePluginConfigField {
    /** If true, render as password input (e.g. API keys) */
    secret?: boolean
}

/**
 * Input to provision a new service (from product + order context).
 */
export interface ProvisionServiceInput {
    productId: number
    productName: string
    serviceName: string
    userId: number
    /** Plugin-specific config from product integration */
    pluginConfig: Record<string, unknown>
    /** Optional billing/location metadata */
    metadata?: Record<string, unknown>
}

/**
 * Result of provisioning a service (external ID and optional data).
 */
export interface ProvisionServiceResult {
    externalId: string
    /** Optional extra data to store with the service */
    metadata?: Record<string, unknown>
}

/**
 * Input for updating an existing service (e.g. upgrade/downgrade).
 */
export interface UpdateServiceInput {
    serviceId: number
    externalId: string
    productId: number
    pluginConfig: Record<string, unknown>
    metadata?: Record<string, unknown>
}

/**
 * Service plugin contract (backend). Handles provisioning and lifecycle.
 */
export interface ServicePlugin {
    readonly manifest: PluginManifest
    /** Returns config fields for product/service setup UI */
    getConfigFields(): ServicePluginConfigField[]
    /** Returns options for a select field (e.g. nodes, eggs from panel API). Context contains current form values (e.g. nestId for eggId). */
    getFieldOptions?(
        fieldKey: string,
        context: Record<string, unknown>
    ): Promise<PluginFieldOption[]>
    /** Returns fields for this plugin's own settings (API keys, URLs). Rendered in admin plugin config. */
    getSettingsSchema?(): PluginSettingsField[]
    /** Returns current issues (e.g. missing config, API errors). Shown on plugin Issues page. */
    getIssues?(): Promise<PluginIssue[]>
    /** Provisions a new resource on the external platform */
    provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult>
    /** Updates an existing resource */
    updateService?(input: UpdateServiceInput): Promise<void>
    /** Suspends the resource on the external platform */
    suspendService?(externalId: string, reason?: string): Promise<void>
    /** Resumes a suspended resource */
    resumeService?(externalId: string): Promise<void>
    /** Deletes or deprovisions the resource */
    deleteService?(externalId: string): Promise<void>
}

/**
 * Payment request passed to a gateway plugin.
 */
export interface GatewayPaymentRequest {
    invoiceId: number
    amount: number
    currency: string
    userId: number
    /** Optional return/success/cancel URLs */
    returnUrl?: string
    cancelUrl?: string
    metadata?: Record<string, unknown>
}

/**
 * Result of initiating a payment (e.g. redirect URL or client secret).
 */
export interface GatewayPaymentResult {
    /** If set, client should redirect user to this URL */
    redirectUrl?: string
    /** If set, client uses this for Stripe-like confirmations (e.g. client_secret) */
    clientSecret?: string
    /** Transaction or session ID from the gateway */
    transactionId?: string
    /** If true, payment is already complete (e.g. account balance) */
    completed?: boolean
}

/**
 * Webhook payload for gateway to report payment status.
 */
export interface GatewayWebhookPayload {
    /** Raw body or parsed payload from gateway */
    body: unknown
    headers: Record<string, string>
    /** Query params if any */
    query?: Record<string, string>
}

/**
 * Gateway plugin contract (backend). Handles payment and webhooks.
 */
export interface GatewayPlugin {
    readonly manifest: PluginManifest
    /** Unique payment provider key stored on invoice (e.g. "stripe", "paypal") */
    getPaymentProviderKey(): string
    /** Returns fields for this plugin's own settings (API keys, webhook secret). Rendered in admin plugin config. */
    getSettingsSchema?(): PluginSettingsField[]
    /** Returns current issues (e.g. missing config, API errors). Shown on plugin Issues page. */
    getIssues?(): Promise<PluginIssue[]>
    /** Initiates payment; returns redirect URL, client secret, or completion flag */
    processPayment(
        request: GatewayPaymentRequest
    ): Promise<GatewayPaymentResult>
    /** Handles gateway webhook (payment completed/failed). Returns invoice id and paid status. */
    handleWebhook?(
        payload: GatewayWebhookPayload
    ): Promise<{ invoiceId: number; paid: boolean } | null>
}

/**
 * Plugin registry contract: list and get plugins by type or id.
 */
export interface PluginRegistry {
    getAll(): Promise<{ manifest: PluginManifest; enabled: boolean }[]>
    getById(
        id: string
    ): Promise<{ manifest: PluginManifest; enabled: boolean } | null>
    getGateways(): Promise<GatewayPlugin[]>
    getServices(): Promise<ServicePlugin[]>
    getGateway(id: string): Promise<GatewayPlugin | null>
    getService(id: string): Promise<ServicePlugin | null>
}
