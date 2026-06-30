export type {
    ServicePluginConfigField,
    PluginSettingsField,
    PluginFieldOption,
    PluginIssue,
    PluginManifest,
    PluginType,
} from '@fluxo/forge'

import type {
    ServicePluginConfigField,
    PluginSettingsField,
} from '@fluxo/forge'

/** Plugin settings form field (admin plugin config). */
export interface PluginSettingsFieldLocal {
    key: string
    label: string
    type: 'number' | 'string' | 'boolean' | 'select'
    required?: boolean
    default?: unknown
    options?: { value: string | number; label: string }[]
    min?: number
    max?: number
    placeholder?: string
    secret?: boolean
}

export interface PluginListItem {
    id: string
    name: string
    version: string
    type: 'gateway' | 'service'
    description?: string
    author?: string
    shipped?: boolean
    icon?: string
    iconUrl?: string | null
    enabled: boolean
    config: Record<string, unknown> | null
    configFields?: ServicePluginConfigField[]
    settingsSchema?: PluginSettingsField[]
}

export interface GatewayPluginListItem {
    id: string
    name: string
    paymentProviderKey: string
}
