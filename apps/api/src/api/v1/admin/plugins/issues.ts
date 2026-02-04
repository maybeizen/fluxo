import type { Request, Response } from 'express'
import { getPluginRegistry } from '../../../../plugins/registry'

/**
 * GET /admin/plugins/:id/issues
 * Returns issues reported by the plugin (e.g. missing config, API errors).
 */
export async function getPluginIssues(req: Request, res: Response) {
    try {
        const pluginId = req.params.id as string
        const registry = getPluginRegistry()
        const entry = await registry.getById(pluginId)
        if (!entry) {
            return res
                .status(404)
                .json({ success: false, message: 'Plugin not found' })
        }

        const plugin =
            entry.manifest.type === 'gateway'
                ? await registry.getGateway(pluginId)
                : await registry.getService(pluginId)
        if (!plugin?.getIssues) {
            return res.status(200).json({ success: true, issues: [] })
        }

        const issues = await plugin.getIssues()
        return res.status(200).json({ success: true, issues })
    } catch (error: unknown) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to get plugin issues',
        })
    }
}
