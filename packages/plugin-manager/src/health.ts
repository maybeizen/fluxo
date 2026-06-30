import type {
    FluxoGatewayPlugin,
    FluxoServerPlugin,
    PluginManifest,
} from '@fluxo/forge'
import type { SafeInvokeTracker } from './safe-invoke.js'

export type PluginHealthStatus =
    'healthy' | 'degraded' | 'quarantined' | 'disabled'

export interface PluginHealthReport {
    pluginId: string
    type: PluginManifest['type']
    status: PluginHealthStatus
    enabled: boolean
    failureCount: number
    missingDependencies?: string[]
}

export function buildPluginHealthReports(
    manifests: Map<string, PluginManifest>,
    enabled: Map<string, boolean>,
    tracker: SafeInvokeTracker,
    loadedIds: Set<string>,
    dependencyErrors: Map<string, string[]>
): PluginHealthReport[] {
    const reports: PluginHealthReport[] = []

    for (const [id, manifest] of manifests) {
        const isEnabled = enabled.get(id) ?? true
        const failureCount = tracker.getFailureCount(id)
        const missingDependencies = dependencyErrors.get(id)
        let status: PluginHealthStatus = 'healthy'

        if (!isEnabled) {
            status = 'disabled'
        } else if (tracker.isQuarantined(id)) {
            status = 'quarantined'
        } else if (
            !loadedIds.has(id) ||
            (missingDependencies && missingDependencies.length > 0)
        ) {
            status = 'degraded'
        } else if (failureCount > 0) {
            status = 'degraded'
        }

        reports.push({
            pluginId: id,
            type: manifest.type,
            status,
            enabled: isEnabled,
            failureCount,
            missingDependencies,
        })
    }

    return reports
}

export function resolvePluginDependencies(
    manifests: Map<string, PluginManifest>
): Map<string, string[]> {
    const errors = new Map<string, string[]>()
    const ids = new Set(manifests.keys())

    for (const [id, manifest] of manifests) {
        const deps = manifest.dependencies ?? []
        const missing = deps.filter((dep) => !ids.has(dep))
        if (missing.length > 0) {
            errors.set(id, missing)
        }
    }

    return errors
}

export type LoadedPlugin = FluxoGatewayPlugin | FluxoServerPlugin
