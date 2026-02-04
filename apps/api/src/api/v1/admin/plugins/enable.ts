import type { Request, Response } from 'express'
import { getDb, plugins } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import { getPluginRegistry } from '../../../../plugins/registry'

export async function enablePlugin(req: Request, res: Response) {
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
        const [existing] = await db
            .select()
            .from(plugins)
            .where(eq(plugins.id, id))
            .limit(1)
        if (existing) {
            await db
                .update(plugins)
                .set({ enabled: true, updatedAt: new Date() })
                .where(eq(plugins.id, id))
        } else {
            await db.insert(plugins).values({
                id: entry.manifest.id,
                name: entry.manifest.name,
                version: entry.manifest.version,
                enabled: true,
            })
        }
        res.status(200).json({ success: true, message: 'Plugin enabled' })
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to enable plugin',
        })
    }
}
