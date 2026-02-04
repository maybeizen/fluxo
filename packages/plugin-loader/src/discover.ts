import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { PluginManifest } from '@fluxo/types'
import { validateManifest } from './manifest.js'

export interface DiscoveredPlugin {
    dir: string
    manifest: PluginManifest
}

/**
 * Discovers all plugins in the given directory. Each subdirectory containing a plugin.json is returned.
 */
export async function discoverPlugins(
    pluginsDir: string
): Promise<DiscoveredPlugin[]> {
    const entries = await readdir(pluginsDir, { withFileTypes: true })
    const result: DiscoveredPlugin[] = []

    for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const pluginDir = join(pluginsDir, entry.name)
        const manifestPath = join(pluginDir, 'plugin.json')
        let raw: unknown
        try {
            const content = await readFile(manifestPath, 'utf-8')
            raw = JSON.parse(content) as unknown
        } catch {
            continue
        }
        try {
            const manifest = validateManifest(raw)
            result.push({ dir: pluginDir, manifest })
        } catch {
            continue
        }
    }

    return result
}
