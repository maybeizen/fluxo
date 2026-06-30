import type { ComponentType } from 'react'
import type { PluginListItem, ServicePluginConfigField } from './types'
import { fetchPluginsList, fetchGatewayPlugins } from './api'

export type ServicePluginConfigComponentProps = {
    value: Record<string, unknown>
    onChange: (value: Record<string, unknown>) => void
    configFields: ServicePluginConfigField[]
    disabled?: boolean
}

export type GatewayCheckoutComponentProps = {
    invoiceId: number
    amount: number
    currency: string
    returnUrl?: string
    cancelUrl?: string
    onSuccess?: (result: {
        redirectUrl?: string
        clientSecret?: string
        completed?: boolean
    }) => void
    onError?: (message: string) => void
}

/**
 * Registry of plugin frontend components. Populate when adding plugins.
 * Keys are plugin ids; values are lazy-loaded components.
 */
const servicePluginConfigRegistry: Partial<
    Record<
        string,
        () => Promise<{
            default: ComponentType<ServicePluginConfigComponentProps>
        }>
    >
> = {}

const gatewayCheckoutRegistry: Partial<
    Record<
        string,
        () => Promise<{ default: ComponentType<GatewayCheckoutComponentProps> }>
    >
> = {}

/**
 * Register a service plugin's config form component.
 */
export function registerServicePluginConfig(
    pluginId: string,
    importFn: () => Promise<{
        default: ComponentType<ServicePluginConfigComponentProps>
    }>
) {
    servicePluginConfigRegistry[pluginId] = importFn
}

/**
 * Register a gateway plugin's checkout component.
 */
export function registerGatewayCheckout(
    pluginId: string,
    importFn: () => Promise<{
        default: ComponentType<GatewayCheckoutComponentProps>
    }>
) {
    gatewayCheckoutRegistry[pluginId] = importFn
}

/**
 * Returns the lazy component for a service plugin's config form, or null if not registered.
 */
export function getServicePluginConfigComponent(pluginId: string):
    | (() => Promise<{
          default: ComponentType<ServicePluginConfigComponentProps>
      }>)
    | null {
    return servicePluginConfigRegistry[pluginId] ?? null
}

/**
 * Returns the lazy component for a gateway plugin's checkout UI, or null if not registered.
 */
export function getGatewayCheckoutComponent(
    pluginId: string
):
    | (() => Promise<{ default: ComponentType<GatewayCheckoutComponentProps> }>)
    | null {
    return gatewayCheckoutRegistry[pluginId] ?? null
}

/**
 * Fetches the list of plugins from the API (admin).
 */
export { fetchPluginsList }

/**
 * Fetches the list of enabled gateway plugins for checkout (public).
 */
export { fetchGatewayPlugins }

export type {
    PluginListItem,
    ServicePluginConfigField,
    GatewayPluginListItem,
} from './types'
