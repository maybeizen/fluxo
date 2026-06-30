import { resolve, sep } from 'node:path'

const MIME_BY_EXT: Record<string, string> = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
}

export function resolvePluginIconPath(
    pluginDir: string,
    iconRelPath: string
): string | null {
    const resolvedPluginDir = resolve(pluginDir)
    const resolvedIcon = resolve(resolvedPluginDir, iconRelPath)
    const normalizedPluginDir = resolvedPluginDir.endsWith(sep)
        ? resolvedPluginDir
        : resolvedPluginDir + sep

    if (!resolvedIcon.startsWith(normalizedPluginDir)) {
        return null
    }

    return resolvedIcon
}

export function getPluginIconMimeType(filePath: string): string {
    const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
    return MIME_BY_EXT[ext] ?? 'application/octet-stream'
}

export function getPluginIconUrl(id: string): string {
    return `/api/v1/public/plugins/${id}/icon`
}
