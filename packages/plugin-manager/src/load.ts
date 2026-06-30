import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import axios from 'axios'
import {
    FluxoGatewayPlugin,
    FluxoServerPlugin,
    createScopedHttp,
    type PluginContext,
    type PluginManifest,
} from '@fluxo/forge'
import type { FluxoLogger } from '@fluxo/logger'
import type { PluginEventBus } from '@fluxo/forge'

export interface PluginDbAccess {
    getPluginRow(
        id: string
    ): Promise<{ enabled: boolean; config: Record<string, unknown> } | null>
    getUser(userId: number): Promise<{
        id: number
        email?: string | null
        metadata?: Record<string, unknown>
    } | null>
}

function parseAllowedHosts(): string[] {
    const raw = process.env.PLUGIN_HTTP_ALLOWLIST ?? ''
    return raw
        .split(',')
        .map((host) => host.trim())
        .filter(Boolean)
}

export function buildPluginContext(
    manifest: PluginManifest,
    dbAccess: PluginDbAccess,
    events: PluginEventBus,
    logger: FluxoLogger,
    initialConfig: Record<string, unknown> = {}
): PluginContext {
    let cachedConfig: Readonly<Record<string, unknown>> = Object.freeze({
        ...initialConfig,
    })

    const ctx: PluginContext = {
        pluginId: manifest.id,
        manifest,
        logger: {
            success: (msg, cfg) =>
                logger.success(msg, {
                    ...cfg,
                    source: cfg?.source ?? manifest.id,
                }),
            info: (msg, cfg) =>
                logger.info(msg, {
                    ...cfg,
                    source: cfg?.source ?? manifest.id,
                }),
            warn: (msg, cfg) =>
                logger.warn(msg, {
                    ...cfg,
                    source: cfg?.source ?? manifest.id,
                }),
            error: (msg, cfg) =>
                logger.error(msg, {
                    ...cfg,
                    source: cfg?.source ?? manifest.id,
                }),
            fatal: (msg, cfg) =>
                logger.fatal(msg, {
                    ...cfg,
                    source: cfg?.source ?? manifest.id,
                }),
            debug: (msg, cfg) =>
                logger.debug(msg, {
                    ...cfg,
                    source: cfg?.source ?? manifest.id,
                }),
        },
        get config() {
            return cachedConfig
        },
        http: createScopedHttp(() => axios.create(), {
            timeout: 15000,
            allowedHosts: parseAllowedHosts(),
        }),
        events,
        data: {
            getUser: (userId) => dbAccess.getUser(userId),
        },
        refreshConfig: async () => {
            const row = await dbAccess.getPluginRow(manifest.id)
            cachedConfig = Object.freeze({ ...(row?.config ?? {}) })
        },
    }

    return ctx
}

export async function loadPluginClass(
    pluginDir: string,
    manifest: PluginManifest,
    ctx: PluginContext,
    _logger: FluxoLogger
): Promise<FluxoServerPlugin | FluxoGatewayPlugin> {
    const tsEntry = join(pluginDir, 'backend', 'index.ts')
    const jsEntry = join(pluginDir, 'backend', 'index.js')
    const entryPath = existsSync(tsEntry) ? tsEntry : jsEntry

    if (!existsSync(entryPath)) {
        throw new Error(
            `Plugin ${manifest.id} has no backend entry at ${entryPath}`
        )
    }

    const url = pathToFileURL(entryPath).href
    const module = await import(url)
    const PluginClass = module?.default

    if (!PluginClass) {
        throw new Error(`Plugin ${manifest.id} has no default export`)
    }

    if (typeof PluginClass !== 'function') {
        throw new Error(
            `Plugin ${manifest.id} default export must be a class extending FluxoServerPlugin or FluxoGatewayPlugin`
        )
    }

    const instance = new PluginClass(ctx)

    if (manifest.type === 'gateway') {
        if (!(instance instanceof FluxoGatewayPlugin)) {
            throw new Error(
                `Gateway plugin ${manifest.id} must extend FluxoGatewayPlugin`
            )
        }
        if (typeof instance.onLoad === 'function') {
            await instance.onLoad()
        }
        return instance
    }

    if (manifest.type === 'service') {
        if (!(instance instanceof FluxoServerPlugin)) {
            throw new Error(
                `Service plugin ${manifest.id} must extend FluxoServerPlugin`
            )
        }
        if (typeof instance.onLoad === 'function') {
            await instance.onLoad()
        }
        return instance
    }

    throw new Error(
        `Unsupported plugin type for backend load: ${manifest.type}`
    )
}

export async function invokeLifecycleHook(
    plugin: FluxoServerPlugin | FluxoGatewayPlugin,
    hook: 'onEnable' | 'onDisable'
): Promise<void>
export async function invokeLifecycleHook(
    plugin: FluxoServerPlugin | FluxoGatewayPlugin,
    hook: 'onConfigChange',
    newConfig: Readonly<Record<string, unknown>>,
    oldConfig: Readonly<Record<string, unknown>>
): Promise<void>
export async function invokeLifecycleHook(
    plugin: FluxoServerPlugin | FluxoGatewayPlugin,
    hook: 'onEnable' | 'onDisable' | 'onConfigChange',
    newConfig?: Readonly<Record<string, unknown>>,
    oldConfig?: Readonly<Record<string, unknown>>
): Promise<void> {
    if (hook === 'onConfigChange') {
        if (
            typeof plugin.onConfigChange === 'function' &&
            newConfig &&
            oldConfig
        ) {
            await plugin.onConfigChange(newConfig, oldConfig)
        }
        return
    }
    if (hook === 'onEnable' && typeof plugin.onEnable === 'function') {
        await plugin.onEnable()
    }
    if (hook === 'onDisable' && typeof plugin.onDisable === 'function') {
        await plugin.onDisable()
    }
}
