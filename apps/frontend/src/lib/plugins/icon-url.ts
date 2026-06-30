import { getApiOrigin } from '@/lib/storage'

export function getPluginIconUrl(id: string): string {
    return `${getApiOrigin()}/api/v1/public/plugins/${id}/icon`
}

export function resolvePluginIconUrl(
    id: string,
    iconUrl?: string | null
): string | null {
    if (iconUrl) {
        if (/^https?:\/\//i.test(iconUrl)) return iconUrl
        return `${getApiOrigin()}${iconUrl.startsWith('/') ? iconUrl : `/${iconUrl}`}`
    }
    return null
}
