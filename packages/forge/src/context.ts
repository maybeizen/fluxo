import type { FluxoLogger } from '@fluxo/logger'
import type { AxiosInstance } from 'axios'
import type { PluginManifest } from './manifest.js'
import type { PluginEventBus } from './event-bus.js'

export interface PluginUserData {
    id: number
    email?: string | null
    pterodactylId?: string | null
    metadata?: Record<string, unknown>
}

export interface PluginDataAccessors {
    getUser(userId: number): Promise<PluginUserData | null>
}

export interface PluginContext {
    pluginId: string
    manifest: PluginManifest
    logger: FluxoLogger
    config: Readonly<Record<string, unknown>>
    http: AxiosInstance
    events: PluginEventBus
    data: PluginDataAccessors
    refreshConfig(): Promise<void>
}

export interface ScopedHttpOptions {
    baseURL?: string
    timeout?: number
    headers?: Record<string, string>
    allowedHosts?: string[]
}

export interface HttpGuardOptions {
    timeout?: number
    allowedHosts?: string[]
    blockPrivateNetworks?: boolean
}

const PRIVATE_HOST_PATTERNS = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^0\.0\.0\.0$/,
    /^::1$/,
    /^\[::1\]$/,
]

export function isPrivateOrLocalHost(hostname: string): boolean {
    return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname))
}

export function assertAllowedHttpUrl(
    url: string,
    options: HttpGuardOptions = {}
): void {
    const { allowedHosts = [], blockPrivateNetworks = true } = options
    let parsed: URL
    try {
        parsed = new URL(url)
    } catch {
        throw new Error(`Invalid HTTP URL: ${url}`)
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error(
            `Blocked HTTP request: unsupported protocol ${parsed.protocol}`
        )
    }

    const hostname = parsed.hostname.toLowerCase()

    if (allowedHosts.some((host) => host.toLowerCase() === hostname)) {
        return
    }

    if (blockPrivateNetworks && isPrivateOrLocalHost(hostname)) {
        throw new Error(
            `Blocked HTTP request to private/local host: ${hostname}. Add to PLUGIN_HTTP_ALLOWLIST to permit.`
        )
    }
}

export function createScopedHttp(
    axiosFactory: () => AxiosInstance,
    options: ScopedHttpOptions = {}
): AxiosInstance {
    const client = axiosFactory()
    if (options.baseURL) client.defaults.baseURL = options.baseURL
    if (options.timeout) client.defaults.timeout = options.timeout
    if (options.headers) {
        client.defaults.headers.common = {
            ...client.defaults.headers.common,
            ...options.headers,
        }
    }

    const guardOptions: HttpGuardOptions = {
        allowedHosts: options.allowedHosts,
        blockPrivateNetworks: true,
    }

    client.interceptors.request.use((config) => {
        const base = config.baseURL ?? client.defaults.baseURL ?? ''
        const target = new URL(config.url ?? '', base || undefined).toString()
        assertAllowedHttpUrl(target, guardOptions)
        return config
    })

    return client
}
