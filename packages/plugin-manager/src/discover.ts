import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { validateManifest, type PluginManifest } from '@fluxo/forge'
import type { FluxoLogger } from '@fluxo/logger'

export interface DiscoveredPlugin {
    dir: string
    manifest: PluginManifest
}

export interface DiscoverOptions {
    includeThemes?: boolean
}

export async function discoverPlugins(
    pluginsDir: string,
    logger: FluxoLogger,
    options: DiscoverOptions = {}
): Promise<DiscoveredPlugin[]> {
    let entries
    try {
        entries = await readdir(pluginsDir, { withFileTypes: true })
    } catch {
        logger.warn(`Plugins directory not found: ${pluginsDir}`, {
            source: 'PluginManager',
        })
        return []
    }

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
            logger.warn(
                `Skipping ${entry.name}: missing or invalid plugin.json`,
                {
                    source: 'PluginManager',
                }
            )
            continue
        }
        try {
            const manifest = validateManifest(raw)
            if (manifest.type === 'theme' && !options.includeThemes) {
                logger.info(
                    `Skipping theme plugin ${manifest.id} (themes load in frontend)`,
                    { source: 'PluginManager' }
                )
                continue
            }
            result.push({ dir: pluginDir, manifest })
        } catch (err) {
            logger.warn(
                `Skipping ${entry.name}: ${err instanceof Error ? err.message : String(err)}`,
                { source: 'PluginManager' }
            )
        }
    }

    return result
}
