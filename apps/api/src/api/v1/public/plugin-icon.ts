import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import type { Request, Response } from 'express'
import { getPluginManager } from '../../../plugins/manager'
import {
    getPluginIconMimeType,
    resolvePluginIconPath,
} from '../../../utils/plugin-icon'

export async function getPluginIcon(req: Request, res: Response) {
    try {
        const id = req.params.id as string
        const registry = getPluginManager()
        const entry = await registry.getById(id)

        if (!entry?.manifest.icon) {
            return res
                .status(404)
                .json({ success: false, message: 'Plugin icon not found' })
        }

        const pluginDir = registry.getPluginDir(id)
        if (!pluginDir) {
            return res
                .status(404)
                .json({ success: false, message: 'Plugin icon not found' })
        }

        const iconPath = resolvePluginIconPath(pluginDir, entry.manifest.icon)
        if (!iconPath) {
            return res
                .status(404)
                .json({ success: false, message: 'Plugin icon not found' })
        }

        try {
            await access(iconPath)
        } catch {
            return res
                .status(404)
                .json({ success: false, message: 'Plugin icon not found' })
        }

        const mimeType = getPluginIconMimeType(iconPath)
        res.setHeader('Content-Type', mimeType)
        res.setHeader('Cache-Control', 'public, max-age=86400')
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
        createReadStream(iconPath).pipe(res)
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to serve plugin icon',
        })
    }
}
