/** Plugin settings form field (admin plugin config). */
export interface PluginSettingsField {
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
    /** True if plugin ships with the app; false if user-installed */
    shipped?: boolean
    enabled: boolean
    config: Record<string, unknown> | null
    configFields?: ServicePluginConfigField[]
    /** Schema for plugin's own settings (API keys, URLs). Rendered as form in admin. */
    settingsSchema?: PluginSettingsField[]
}

export interface ServicePluginConfigField {
    key: string
    label: string
    type: 'number' | 'string' | 'boolean' | 'select'
    required?: boolean
    default?: unknown
    options?: { value: string | number; label: string }[]
    /** When true, options are fetched from the plugin API (e.g. nodes, eggs from panel). */
    dynamicOptions?: boolean
    min?: number
    max?: number
    placeholder?: string
}

export interface GatewayPluginListItem {
    id: string
    name: string
    paymentProviderKey: string
}
