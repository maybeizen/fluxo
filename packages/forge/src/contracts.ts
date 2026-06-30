export interface ServicePluginConfigField {
    key: string
    label: string
    type: 'number' | 'string' | 'boolean' | 'select'
    required?: boolean
    default?: unknown
    options?: { value: string | number; label: string }[]
    dynamicOptions?: boolean
    min?: number
    max?: number
    placeholder?: string
}

export interface PluginFieldOption {
    value: string | number
    label: string
}

export interface PluginIssue {
    message: string
    severity: 'error' | 'warning' | 'info'
    details?: string
}

export interface PluginSettingsField extends ServicePluginConfigField {
    secret?: boolean
}

export interface ProvisionServiceInput {
    productId: number
    productName: string
    serviceName: string
    userId: number
    pluginConfig: Record<string, unknown>
    metadata?: Record<string, unknown>
}

export interface ProvisionServiceResult {
    externalId: string
    metadata?: Record<string, unknown>
}

export interface UpdateServiceInput {
    serviceId: number
    externalId: string
    productId: number
    pluginConfig: Record<string, unknown>
    metadata?: Record<string, unknown>
}

export interface GatewayPaymentRequest {
    invoiceId: number
    amount: number
    currency: string
    userId: number
    returnUrl?: string
    cancelUrl?: string
    metadata?: Record<string, unknown>
}

export interface GatewayPaymentResult {
    redirectUrl?: string
    clientSecret?: string
    transactionId?: string
    completed?: boolean
}

export interface GatewayWebhookPayload {
    body: unknown
    headers: Record<string, string>
    query?: Record<string, string>
}

export interface ThemeTokens {
    colors?: Record<string, string>
    fonts?: Record<string, string>
    cssVars?: Record<string, string>
}

export interface ThemeLoaderContract {
    getTokens(): ThemeTokens
    getLayout(): unknown
    getCssPath(): string
    getThemeJsonPath?(): string
}

export type { PluginLifecycleHooks } from './lifecycle.js'

import type { PluginContext } from './context.js'
import type { PluginManifest } from './manifest.js'
import type { PluginEventMap } from './event-bus.js'

export interface ThemeManifestReference {
    layout: unknown
    css: string
}

export interface PluginRegistryEntry {
    manifest: PluginManifest
    enabled: boolean
}

export interface PluginRegistry {
    getAll(): Promise<PluginRegistryEntry[]>
    getById(id: string): Promise<PluginRegistryEntry | null>
    getGateways(): Promise<FluxoGatewayPlugin[]>
    getServices(): Promise<FluxoServerPlugin[]>
    getGateway(id: string): Promise<FluxoGatewayPlugin | null>
    getService(id: string): Promise<FluxoServerPlugin | null>
    getThemes(): Promise<PluginRegistryEntry[]>
}

export abstract class FluxoServerPlugin {
    readonly manifest: PluginManifest
    protected ctx: PluginContext

    constructor(ctx: PluginContext) {
        this.ctx = ctx
        this.manifest = ctx.manifest
    }

    onLoad?(): void | Promise<void>
    onEnable?(): void | Promise<void>
    onDisable?(): void | Promise<void>
    onConfigChange?(
        newConfig: Readonly<Record<string, unknown>>,
        oldConfig: Readonly<Record<string, unknown>>
    ): void | Promise<void>

    abstract getConfigFields(): ServicePluginConfigField[]
    abstract provisionService(
        input: ProvisionServiceInput
    ): Promise<ProvisionServiceResult>

    getFieldOptions?(
        fieldKey: string,
        context: Record<string, unknown>
    ): Promise<PluginFieldOption[]>

    getSettingsSchema?(): PluginSettingsField[]

    getIssues?(): Promise<PluginIssue[]>

    updateService?(input: UpdateServiceInput): Promise<void>

    suspendService?(externalId: string, reason?: string): Promise<void>

    resumeService?(externalId: string): Promise<void>

    deleteService?(externalId: string): Promise<void>
}

export abstract class FluxoGatewayPlugin {
    readonly manifest: PluginManifest
    protected ctx: PluginContext

    constructor(ctx: PluginContext) {
        this.ctx = ctx
        this.manifest = ctx.manifest
    }

    onLoad?(): void | Promise<void>
    onEnable?(): void | Promise<void>
    onDisable?(): void | Promise<void>
    onConfigChange?(
        newConfig: Readonly<Record<string, unknown>>,
        oldConfig: Readonly<Record<string, unknown>>
    ): void | Promise<void>

    abstract getPaymentProviderKey(): string
    abstract processPayment(
        request: GatewayPaymentRequest
    ): Promise<GatewayPaymentResult>

    getSettingsSchema?(): PluginSettingsField[]

    getIssues?(): Promise<PluginIssue[]>

    handleWebhook?(
        payload: GatewayWebhookPayload
    ): Promise<{ invoiceId: number; paid: boolean } | null>

    protected emit<K extends keyof PluginEventMap>(
        event: K,
        payload: PluginEventMap[K]
    ): void {
        void this.ctx.events.emit(event, payload)
    }
}

export abstract class FluxoThemePlugin implements ThemeLoaderContract {
    readonly manifest: PluginManifest

    constructor(manifest: PluginManifest) {
        this.manifest = manifest
    }

    abstract getTokens(): ThemeTokens

    abstract getLayout(): unknown

    abstract getCssPath(): string

    getThemeJsonPath?(): string
}

/** @deprecated Use FluxoServerPlugin class instances */
export type ServicePlugin = FluxoServerPlugin

/** @deprecated Use FluxoGatewayPlugin class instances */
export type GatewayPlugin = FluxoGatewayPlugin
