import type { Request, Response } from 'express'
import { getPluginManager } from '../../../../plugins/manager'

/**
 * POST /admin/plugins/:id/reload
 * Re-loads all plugins (re-discovers and re-initializes the registry).
 * Use after changing plugin config or to refresh plugin state.
 */
export async function reloadPlugin(_req: Request, res: Response) {
    try {
        const registry = getPluginManager()
        await registry.reload()
        return res
            .status(200)
            .json({ success: true, message: 'Plugins reloaded' })
    } catch (error: unknown) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to reload plugins',
        })
    }
}
