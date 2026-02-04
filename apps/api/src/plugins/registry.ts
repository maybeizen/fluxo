import type {
    GatewayPlugin,
    PluginManifest,
    PluginRegistry as IPluginRegistry,
    ServicePlugin,
} from '@fluxo/types'
import { discoverPlugins, loadBackend } from '@fluxo/plugin-loader'
import { logger } from '../utils/logger'

class PluginRegistryImpl implements IPluginRegistry {
    private pluginsDir: string
    private gateways: Map<string, GatewayPlugin> = new Map()
    private services: Map<string, ServicePlugin> = new Map()
    private manifests: Map<string, PluginManifest> = new Map()
    private initialized = false

    constructor(pluginsDir: string) {
        this.pluginsDir = pluginsDir
    }

    async init(): Promise<void> {
        if (this.initialized) return
        try {
            const discovered = await discoverPlugins(this.pluginsDir)
            for (const { dir, manifest } of discovered) {
                try {
                    const plugin = await loadBackend(dir)
                    this.manifests.set(manifest.id, manifest)
                    if (manifest.type === 'gateway') {
                        this.gateways.set(manifest.id, plugin as GatewayPlugin)
                    } else {
                        this.services.set(manifest.id, plugin as ServicePlugin)
                    }
                    logger.info(
                        `Plugin loaded: ${manifest.id} (${manifest.type})`,
                        {
                            source: 'PluginRegistry',
                        }
                    )
                } catch (err) {
                    logger.error(
                        `Failed to load plugin ${manifest.id}: ${err}`,
                        {
                            source: 'PluginRegistry',
                        }
                    )
                }
            }
            this.initialized = true
        } catch (err) {
            logger.error(`Plugin discovery failed: ${err}`, {
                source: 'PluginRegistry',
            })
        }
    }

    private ensureInit(): void {
        if (!this.initialized) {
            throw new Error(
                'Plugin registry not initialized. Call init() first.'
            )
        }
    }

    async getAll(): Promise<{ manifest: PluginManifest; enabled: boolean }[]> {
        this.ensureInit()
        return Array.from(this.manifests.entries()).map(([id, manifest]) => ({
            manifest,
            enabled: true,
        }))
    }

    async getById(
        id: string
    ): Promise<{ manifest: PluginManifest; enabled: boolean } | null> {
        this.ensureInit()
        const manifest = this.manifests.get(id)
        if (!manifest) return null
        return { manifest, enabled: true }
    }

    async getGateways(): Promise<GatewayPlugin[]> {
        this.ensureInit()
        return Array.from(this.gateways.values())
    }

    async getServices(): Promise<ServicePlugin[]> {
        this.ensureInit()
        return Array.from(this.services.values())
    }

    async getGateway(id: string): Promise<GatewayPlugin | null> {
        this.ensureInit()
        return this.gateways.get(id) ?? null
    }

    async getService(id: string): Promise<ServicePlugin | null> {
        this.ensureInit()
        return this.services.get(id) ?? null
    }

    /** Re-discovers and re-loads all plugins (e.g. after config change). */
    async reload(): Promise<void> {
        this.gateways.clear()
        this.services.clear()
        this.manifests.clear()
        this.initialized = false
        await this.init()
    }
}

let instance: PluginRegistryImpl | null = null

/**
 * Returns the singleton plugin registry. Must be initialized with initPluginRegistry() before use.
 */
export function getPluginRegistry(): PluginRegistryImpl {
    if (!instance) {
        throw new Error(
            'Plugin registry not initialized. Call initPluginRegistry(pluginsDir) first.'
        )
    }
    return instance
}

/**
 * Initializes the plugin registry (discovers and loads all plugins). Call once at app startup.
 */
export async function initPluginRegistry(pluginsDir: string): Promise<void> {
    instance = new PluginRegistryImpl(pluginsDir)
    await instance.init()
}
