import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { GatewayPlugin, PluginManifest, ServicePlugin } from '@fluxo/types'

/**
 * Loads the backend module of a plugin. Expects default export to be GatewayPlugin or ServicePlugin.
 * Tries backend/index.ts then backend/index.js so it works with tsx or compiled output.
 */
export async function loadBackend(
    pluginDir: string
): Promise<GatewayPlugin | ServicePlugin> {
    const tsEntry = join(pluginDir, 'backend', 'index.ts')
    const jsEntry = join(pluginDir, 'backend', 'index.js')
    const entryPath = existsSync(tsEntry) ? tsEntry : jsEntry
    const url = pathToFileURL(entryPath).href
    const module = await import(url)
    const plugin = module?.default
    if (!plugin) {
        throw new Error(`Plugin at ${pluginDir} has no default export`)
    }
    if (typeof plugin.manifest === 'undefined') {
        throw new Error(`Plugin at ${pluginDir} does not expose manifest`)
    }
    const manifest = plugin.manifest as PluginManifest
    if (manifest.type === 'gateway') {
        if (
            typeof plugin.getPaymentProviderKey !== 'function' ||
            typeof plugin.processPayment !== 'function'
        ) {
            throw new Error(
                `Gateway plugin ${manifest.id} must implement getPaymentProviderKey and processPayment`
            )
        }
        return plugin as GatewayPlugin
    }
    if (manifest.type === 'service') {
        if (
            typeof plugin.getConfigFields !== 'function' ||
            typeof plugin.provisionService !== 'function'
        ) {
            throw new Error(
                `Service plugin ${manifest.id} must implement getConfigFields and provisionService`
            )
        }
        return plugin as ServicePlugin
    }
    throw new Error(`Unknown plugin type: ${manifest.type}`)
}
