import type { Request, Response } from 'express'
import { getDb, plugins } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import { getPluginRegistry } from '../../../../plugins/registry'

export async function getPluginById(req: Request, res: Response) {
    try {
        const id = req.params.id as string
        const registry = getPluginRegistry()
        const entry = await registry.getById(id)
        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: 'Plugin not found' })
        }
        const db = getDb()
        const [row] = await db
            .select()
            .from(plugins)
            .where(eq(plugins.id, id))
            .limit(1)
        let settingsSchema: unknown[] = []
        if (entry.manifest.type === 'service') {
            const plugin = await registry.getService(id)
            if (plugin) settingsSchema = plugin.getSettingsSchema?.() ?? []
        } else {
            const plugin = await registry.getGateway(id)
            if (plugin) settingsSchema = plugin.getSettingsSchema?.() ?? []
        }
        res.status(200).json({
            success: true,
            plugin: {
                ...entry.manifest,
                enabled: row?.enabled ?? true,
                config: row?.config ?? null,
                settingsSchema,
            },
        })
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error ? error.message : 'Failed to get plugin',
        })
    }
}
