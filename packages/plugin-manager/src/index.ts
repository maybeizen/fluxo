/**
 * Fluxo plugin manager runs plugins in-process with full host privileges.
 * Only install plugins from trusted sources. ctx.http blocks private/local
 * hosts unless listed in PLUGIN_HTTP_ALLOWLIST.
 */
import { createLogger, type FluxoLogger } from '@fluxo/logger'
import {
    PluginEventBus,
    type FluxoGatewayPlugin,
    type FluxoServerPlugin,
    type PluginManifest,
    type PluginRegistry as IPluginRegistry,
} from '@fluxo/forge'
import { discoverPlugins } from './discover.js'
import {
    buildPluginContext,
    invokeLifecycleHook,
    loadPluginClass,
    type PluginDbAccess,
} from './load.js'
import { SafeInvokeTracker, safeInvoke } from './safe-invoke.js'
import {
    buildPluginHealthReports,
    resolvePluginDependencies,
    type PluginHealthReport,
} from './health.js'

export interface PluginManagerInitOptions {
    pluginsDir: string
    dbAccess: PluginDbAccess
    logger?: FluxoLogger
    themesDir?: string
}

export class PluginManager implements IPluginRegistry {
    private pluginsDir: string
    private themesDir?: string
    private dbAccess: PluginDbAccess
    private logger: FluxoLogger
    private events = new PluginEventBus()
    private tracker = new SafeInvokeTracker()
    private gateways = new Map<string, FluxoGatewayPlugin>()
    private services = new Map<string, FluxoServerPlugin>()
    private pluginInstances = new Map<
        string,
        FluxoGatewayPlugin | FluxoServerPlugin
    >()
    private pluginContexts = new Map<
        string,
        ReturnType<typeof buildPluginContext>
    >()
    private manifests = new Map<string, PluginManifest>()
    private pluginDirs = new Map<string, string>()
    private enabled = new Map<string, boolean>()
    private themeManifests = new Map<string, PluginManifest>()
    private dependencyErrors = new Map<string, string[]>()
    private initialized = false

    constructor(options: PluginManagerInitOptions) {
        this.pluginsDir = options.pluginsDir
        this.themesDir = options.themesDir
        this.dbAccess = options.dbAccess
        this.logger =
            options.logger ?? createLogger({ source: 'PluginManager' })
    }

    get eventBus(): PluginEventBus {
        return this.events
    }

    async init(): Promise<void> {
        if (this.initialized) return

        await this.loadThemesMetadata()

        const discovered = await discoverPlugins(this.pluginsDir, this.logger)
        for (const { dir, manifest } of discovered) {
            this.manifests.set(manifest.id, manifest)
            this.pluginDirs.set(manifest.id, dir)
        }
        this.dependencyErrors = resolvePluginDependencies(this.manifests)

        for (const { dir, manifest } of discovered) {
            const missing = this.dependencyErrors.get(manifest.id)
            if (missing?.length) {
                this.logger.warn(
                    `Plugin ${manifest.id} missing dependencies: ${missing.join(', ')}`,
                    { source: 'PluginManager' }
                )
            }

            try {
                const row = await this.dbAccess.getPluginRow(manifest.id)
                this.enabled.set(manifest.id, row?.enabled ?? true)

                const ctx = buildPluginContext(
                    manifest,
                    this.dbAccess,
                    this.events,
                    this.logger,
                    row?.config ?? {}
                )
                this.pluginContexts.set(manifest.id, ctx)

                const plugin = await loadPluginClass(
                    dir,
                    manifest,
                    ctx,
                    this.logger
                )
                this.pluginInstances.set(manifest.id, plugin)

                if (manifest.type === 'gateway') {
                    this.gateways.set(manifest.id, plugin as FluxoGatewayPlugin)
                } else {
                    this.services.set(manifest.id, plugin as FluxoServerPlugin)
                }

                this.logger.info(
                    `Plugin loaded: ${manifest.id} (${manifest.type})`,
                    { source: 'PluginManager' }
                )
            } catch (err) {
                this.logger.error(
                    `Failed to load plugin ${manifest.id}: ${err}`,
                    { source: 'PluginManager' }
                )
            }
        }

        this.initialized = true
    }

    private async loadThemesMetadata(): Promise<void> {
        if (!this.themesDir) return
        const discovered = await discoverPlugins(this.themesDir, this.logger, {
            includeThemes: true,
        })
        for (const { manifest } of discovered) {
            if (manifest.type === 'theme') {
                this.themeManifests.set(manifest.id, manifest)
            }
        }
        for (const { dir, manifest } of discovered) {
            if (manifest.type === 'theme') {
                this.pluginDirs.set(manifest.id, dir)
            }
        }
    }

    private ensureInit(): void {
        if (!this.initialized) {
            throw new Error(
                'Plugin manager not initialized. Call init() first.'
            )
        }
    }

    async getAll(): Promise<{ manifest: PluginManifest; enabled: boolean }[]> {
        this.ensureInit()
        return Array.from(this.manifests.entries()).map(([id, manifest]) => ({
            manifest,
            enabled: this.enabled.get(id) ?? true,
        }))
    }

    async getById(
        id: string
    ): Promise<{ manifest: PluginManifest; enabled: boolean } | null> {
        this.ensureInit()
        const manifest = this.manifests.get(id) ?? this.themeManifests.get(id)
        if (!manifest) return null
        return { manifest, enabled: this.enabled.get(id) ?? true }
    }

    async getGateways(): Promise<FluxoGatewayPlugin[]> {
        this.ensureInit()
        return Array.from(this.gateways.values())
    }

    async getServices(): Promise<FluxoServerPlugin[]> {
        this.ensureInit()
        return Array.from(this.services.values())
    }

    async getGateway(id: string): Promise<FluxoGatewayPlugin | null> {
        this.ensureInit()
        return this.gateways.get(id) ?? null
    }

    async getService(id: string): Promise<FluxoServerPlugin | null> {
        this.ensureInit()
        return this.services.get(id) ?? null
    }

    async getThemes(): Promise<
        { manifest: PluginManifest; enabled: boolean }[]
    > {
        this.ensureInit()
        return Array.from(this.themeManifests.entries()).map(
            ([id, manifest]) => ({
                manifest,
                enabled: this.enabled.get(id) ?? true,
            })
        )
    }

    getHealth(): PluginHealthReport[] {
        this.ensureInit()
        const loadedIds = new Set(this.pluginInstances.keys())
        return buildPluginHealthReports(
            this.manifests,
            this.enabled,
            this.tracker,
            loadedIds,
            this.dependencyErrors
        )
    }

    async reload(): Promise<void> {
        this.gateways.clear()
        this.services.clear()
        this.pluginInstances.clear()
        this.pluginContexts.clear()
        this.manifests.clear()
        this.pluginDirs.clear()
        this.enabled.clear()
        this.themeManifests.clear()
        this.dependencyErrors.clear()
        this.tracker.reset()
        this.initialized = false
        await this.init()
    }

    async refreshPluginState(id: string): Promise<void> {
        const row = await this.dbAccess.getPluginRow(id)
        if (!row) return

        const wasEnabled = this.enabled.get(id) ?? true
        this.enabled.set(id, row.enabled)

        const plugin = this.pluginInstances.get(id)
        const ctx = this.pluginContexts.get(id)
        if (plugin && ctx) {
            const oldConfig = { ...ctx.config }
            await ctx.refreshConfig()
            if (typeof plugin.onConfigChange === 'function') {
                await invokeLifecycleHook(
                    plugin,
                    'onConfigChange',
                    ctx.config,
                    oldConfig
                )
            }
        }

        if (wasEnabled && !row.enabled && plugin) {
            await invokeLifecycleHook(plugin, 'onDisable')
        } else if (!wasEnabled && row.enabled && plugin) {
            await invokeLifecycleHook(plugin, 'onEnable')
        }
    }

    isEnabled(id: string): boolean {
        return this.enabled.get(id) ?? true
    }

    getPluginDir(id: string): string | undefined {
        return this.pluginDirs.get(id)
    }

    async invoke<T>(
        pluginId: string,
        method: string,
        fn: () => Promise<T> | T
    ): Promise<T> {
        return safeInvoke(
            pluginId,
            method,
            fn,
            this.logger,
            this.events,
            this.tracker
        )
    }
}

let instance: PluginManager | null = null

export function getPluginManager(): PluginManager {
    if (!instance) {
        throw new Error(
            'Plugin manager not initialized. Call initPluginManager() first.'
        )
    }
    return instance
}

export async function initPluginManager(
    options: PluginManagerInitOptions
): Promise<PluginManager> {
    instance = new PluginManager(options)
    await instance.init()
    return instance
}

export {
    buildPluginContext,
    loadPluginClass,
    invokeLifecycleHook,
    type PluginDbAccess,
} from './load.js'
export { runPluginMigrations, type MigrationExecutor } from './migrations.js'
export { safeInvoke, SafeInvokeTracker } from './safe-invoke.js'
export { discoverPlugins, type DiscoveredPlugin } from './discover.js'
export {
    buildPluginHealthReports,
    resolvePluginDependencies,
    type PluginHealthReport,
    type PluginHealthStatus,
} from './health.js'
