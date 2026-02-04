import type { Request, Response } from 'express'
import { getPluginRegistry } from '../../../../plugins/registry'

/**
 * GET /admin/plugins/:id/field-options/:fieldKey
 * Query params are passed as context (e.g. nestId for eggId).
 * Returns { success, options: { value, label }[] } for dynamic select fields.
 */
export async function getPluginFieldOptions(req: Request, res: Response) {
    try {
        const pluginId = req.params.id as string
        const fieldKey = req.params.fieldKey as string
        const context: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(req.query)) {
            if (typeof val === 'string') {
                const num = Number(val)
                context[key] = Number.isNaN(num) ? val : num
            }
        }

        const registry = getPluginRegistry()
        const entry = await registry.getById(pluginId)
        if (!entry || entry.manifest.type !== 'service') {
            return res
                .status(404)
                .json({ success: false, message: 'Plugin not found' })
        }

        const plugin = await registry.getService(pluginId)
        if (!plugin?.getFieldOptions) {
            return res.status(400).json({
                success: false,
                message: 'Plugin does not support dynamic field options',
            })
        }

        const options = await plugin.getFieldOptions(fieldKey, context)
        return res.status(200).json({ success: true, options })
    } catch (error: unknown) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to get field options',
        })
    }
}
