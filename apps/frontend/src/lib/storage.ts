export function getApiOrigin(): string {
    const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'
    return apiUrl.replace(/\/api\/v1\/?$/, '')
}

export function resolveStorageUrl(
    value: string | null | undefined
): string | null {
    if (!value) return null

    if (/^https?:\/\//i.test(value)) {
        return value
    }

    if (value.startsWith('/storage/')) {
        return `${getApiOrigin()}${value}`
    }

    if (
        value.startsWith('avatars/') ||
        value.startsWith('logos/') ||
        value.startsWith('tickets/')
    ) {
        return `${getApiOrigin()}/storage/${value}`
    }

    return value
}

export type AvatarVariantSize = 64 | 256 | 'full'

const VARIANT_SUFFIX_PATTERN = /-(64|256|full)\.webp$/i
const LEGACY_RASTER_EXT = /\.(jpe?g|png|gif)$/i

function isLegacyRasterUrl(url: string): boolean {
    return LEGACY_RASTER_EXT.test(url) && !VARIANT_SUFFIX_PATTERN.test(url)
}

export function avatarVariant(
    url: string | null | undefined,
    size: AvatarVariantSize
): string | null {
    const resolved = resolveStorageUrl(url)
    if (!resolved) return null

    const suffix = size === 'full' ? 'full' : String(size)

    if (VARIANT_SUFFIX_PATTERN.test(resolved)) {
        return resolved.replace(VARIANT_SUFFIX_PATTERN, `-${suffix}.webp`)
    }

    if (/\.webp$/i.test(resolved)) {
        return resolved
    }

    if (isLegacyRasterUrl(resolved)) {
        return resolved
    }

    return `${resolved}-${suffix}.webp`
}
