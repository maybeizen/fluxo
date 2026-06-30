import { getStorageDriver } from './index'
import type { ImageVariantSize } from '../image'

const ABSOLUTE_URL = /^https?:\/\//i

export function isAbsoluteStorageUrl(value: string): boolean {
    return ABSOLUTE_URL.test(value)
}

export async function resolveStorageUrl(
    keyOrUrl: string | null | undefined,
    size: ImageVariantSize = 256
): Promise<string | null> {
    if (!keyOrUrl) return null

    if (isAbsoluteStorageUrl(keyOrUrl)) {
        return keyOrUrl
    }

    const driver = await getStorageDriver()
    return driver.resolveUrl(keyOrUrl, size)
}

export async function resolveAppLogoUrl(
    row: {
        appLogoKey?: string | null
        appLogoUrl?: string | null
    },
    size: ImageVariantSize = 64
): Promise<string | null> {
    if (row.appLogoKey) {
        return resolveStorageUrl(row.appLogoKey, size)
    }
    return row.appLogoUrl ?? null
}

export function parseStorageBaseKey(urlOrKey: string): string | null {
    if (!urlOrKey) return null

    let key = urlOrKey
    const storageIdx = key.indexOf('/storage/')
    if (storageIdx !== -1) {
        key = key.slice(storageIdx + '/storage/'.length)
    }

    if (
        !key.startsWith('avatars/') &&
        !key.startsWith('logos/') &&
        !key.startsWith('tickets/')
    ) {
        return null
    }

    return key.replace(/-(64|256|full)\.webp$/, '').replace(/\.[^.]+$/, '')
}
