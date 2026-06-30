import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createLogger } from '@fluxo/logger'
import { findRepoRoot } from '../../utils/paths.js'
import type { CommandData, CommandExecute } from '../../types.js'

const logger = createLogger({ source: 'CLI', file: false })

export const data: CommandData = {
    name: 'list',
    description: 'List installed plugins',
    usage: 'fluxo plugins list',
    group: 'Plugins',
}

export const execute: CommandExecute = async () => {
    const root = findRepoRoot()
    const pluginsDir = join(root, 'plugins')
    const entries = await readdir(pluginsDir, { withFileTypes: true })

    for (const entry of entries) {
        if (!entry.isDirectory()) continue
        const manifestPath = join(pluginsDir, entry.name, 'plugin.json')
        try {
            const raw = await readFile(manifestPath, 'utf-8')
            const manifest = JSON.parse(raw) as {
                id: string
                name: string
                type: string
                version: string
            }
            logger.info(
                `${manifest.id} (${manifest.type}) v${manifest.version} — ${manifest.name}`
            )
        } catch {
            logger.warn(`Skipping ${entry.name}: invalid plugin.json`)
        }
    }
}
