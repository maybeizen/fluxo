import type { Request, Response } from 'express'
import { getDb, plugins } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import { getPluginRegistry } from '../../../../plugins/registry'

export async function listPlugins(_req: Request, res: Response) {
    try {
        const registry = getPluginRegistry()
        const all = await registry.getAll()
        const db = getDb()
        const dbRows = await db.select().from(plugins)
        const byId = new Map(dbRows.map((r) => [r.id, r]))

        const list = await Promise.all(
            all.map(async ({ manifest }) => {
                const row = byId.get(manifest.id)
                const enabled = row?.enabled ?? true
                let configFields: unknown[] | undefined
                let settingsSchema: unknown[] | undefined
                if (manifest.type === 'service') {
                    const plugin = await registry.getService(manifest.id)
                    if (plugin) {
                        if (enabled) configFields = plugin.getConfigFields()
                        settingsSchema = plugin.getSettingsSchema?.() ?? []
                    }
                } else {
                    const plugin = await registry.getGateway(manifest.id)
                    if (plugin)
                        settingsSchema = plugin.getSettingsSchema?.() ?? []
                }
                return {
                    id: manifest.id,
                    name: manifest.name,
                    version: manifest.version,
                    type: manifest.type,
                    description: manifest.description,
                    author: manifest.author,
                    shipped: manifest.shipped ?? false,
                    enabled,
                    config: row?.config ?? null,
                    configFields,
                    settingsSchema: settingsSchema ?? [],
                }
            })
        )

        res.status(200).json({ success: true, plugins: list })
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to list plugins',
        })
    }
}
