import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { ImageVariantSize } from '../image'
import type { StorageDriver, StorageVariant } from './types'

const LEGACY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bin']
const VARIANT_SUFFIXES = ['64', '256', 'full'] as const

export class LocalStorageDriver implements StorageDriver {
    constructor(
        private readonly storageDir: string,
        private readonly apiUrl: string
    ) {}

    async saveVariants(
        baseKey: string,
        variants: StorageVariant[]
    ): Promise<void> {
        const { category, baseName } = this.splitBaseKey(baseKey)

        for (const variant of variants) {
            const filename = `${baseName}-${variant.size}.webp`
            const filePath = join(this.storageDir, category, filename)
            await mkdir(dirname(filePath), { recursive: true })
            await writeFile(filePath, variant.buffer)
        }
    }

    resolveUrl(baseKey: string, size: ImageVariantSize = 256): string {
        const { category, baseName } = this.splitBaseKey(baseKey)
        const key = `${category}/${baseName}-${size}.webp`
        return this.buildPublicUrl(key)
    }

    async remove(baseKeyOrUrl: string): Promise<void> {
        const key = this.extractKey(baseKeyOrUrl)
        if (!key) return

        const baseKey = this.normalizeToBaseKey(key)
        const { category, baseName } = this.splitBaseKey(baseKey)

        const filenames = [
            ...VARIANT_SUFFIXES.map((suffix) => `${baseName}-${suffix}.webp`),
            ...LEGACY_EXTENSIONS.map((ext) => `${baseName}${ext}`),
            baseName,
        ]

        await Promise.all(
            filenames.map(async (filename) => {
                const filePath = join(this.storageDir, category, filename)
                try {
                    await unlink(filePath)
                } catch {
                    // best-effort cleanup
                }
            })
        )
    }

    private splitBaseKey(baseKey: string): {
        category: string
        baseName: string
    } {
        const slashIdx = baseKey.indexOf('/')
        if (slashIdx === -1) {
            return { category: '', baseName: baseKey }
        }
        return {
            category: baseKey.slice(0, slashIdx),
            baseName: baseKey.slice(slashIdx + 1),
        }
    }

    private buildPublicUrl(key: string): string {
        return `${this.apiUrl.replace(/\/$/, '')}/storage/${key}`
    }

    private normalizeToBaseKey(key: string): string {
        const withoutExt = key.replace(/\.(webp|png|jpe?g|svg|bin)$/i, '')
        return withoutExt.replace(/-(64|256|full)$/, '')
    }

    private extractKey(urlOrKey: string): string | null {
        const storagePrefix = '/storage/'
        const normalizedApiUrl = this.apiUrl.replace(/\/$/, '')

        if (urlOrKey.startsWith(normalizedApiUrl + storagePrefix)) {
            return urlOrKey.slice((normalizedApiUrl + storagePrefix).length)
        }

        if (urlOrKey.startsWith(storagePrefix)) {
            return urlOrKey.slice(storagePrefix.length)
        }

        if (
            urlOrKey.startsWith('avatars/') ||
            urlOrKey.startsWith('logos/') ||
            urlOrKey.startsWith('tickets/')
        ) {
            return urlOrKey
        }

        return null
    }
}
