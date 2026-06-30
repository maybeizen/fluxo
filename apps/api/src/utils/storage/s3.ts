import { createS3Client } from '@fluxo/s3'
import type { ImageVariantSize } from '../image'
import type { ResolvedS3Config, StorageDriver, StorageVariant } from './types'

const LEGACY_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bin']
const VARIANT_SUFFIXES = ['64', '256', 'full'] as const

export class S3StorageDriver implements StorageDriver {
    private readonly client: ReturnType<typeof createS3Client>

    constructor(private readonly s3Config: ResolvedS3Config) {
        this.client = createS3Client(s3Config)
    }

    async saveVariants(
        baseKey: string,
        variants: StorageVariant[]
    ): Promise<void> {
        const { category, baseName } = this.splitBaseKey(baseKey)

        await Promise.all(
            variants.map((variant) => {
                const key = `${category}/${baseName}-${variant.size}.webp`
                return this.client.putObject({
                    key,
                    body: variant.buffer,
                    contentType: 'image/webp',
                })
            })
        )
    }

    resolveUrl(baseKey: string, size: ImageVariantSize = 256): string {
        const { category, baseName } = this.splitBaseKey(baseKey)
        const key = `${category}/${baseName}-${size}.webp`
        return this.client.getPublicUrl(key)
    }

    async remove(baseKeyOrUrl: string): Promise<void> {
        const key = this.extractKey(baseKeyOrUrl)
        if (!key) return

        const baseKey = this.normalizeToBaseKey(key)
        const { category, baseName } = this.splitBaseKey(baseKey)

        const keys = [
            ...VARIANT_SUFFIXES.map(
                (suffix) => `${category}/${baseName}-${suffix}.webp`
            ),
            ...LEGACY_EXTENSIONS.map((ext) => `${category}/${baseName}${ext}`),
            `${category}/${baseName}`,
        ]

        await Promise.all(
            keys.map(async (objectKey) => {
                try {
                    await this.client.deleteObject(objectKey)
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

    private normalizeToBaseKey(key: string): string {
        const withoutExt = key.replace(/\.(webp|png|jpe?g|svg|bin)$/i, '')
        return withoutExt.replace(/-(64|256|full)$/, '')
    }

    private extractKey(urlOrKey: string): string | null {
        if (
            urlOrKey.startsWith('avatars/') ||
            urlOrKey.startsWith('logos/') ||
            urlOrKey.startsWith('tickets/')
        ) {
            return urlOrKey
        }

        const publicBase = this.s3Config.publicUrlBase?.replace(/\/$/, '')
        if (publicBase && urlOrKey.startsWith(`${publicBase}/`)) {
            return urlOrKey.slice(publicBase.length + 1)
        }

        const endpoint = this.s3Config.endpoint?.replace(/\/$/, '')
        if (endpoint && this.s3Config.forcePathStyle) {
            const prefix = `${endpoint}/${this.s3Config.bucket}/`
            if (urlOrKey.startsWith(prefix)) {
                return urlOrKey.slice(prefix.length)
            }
        }

        const awsPrefix = `https://${this.s3Config.bucket}.s3.${this.s3Config.region}.amazonaws.com/`
        if (urlOrKey.startsWith(awsPrefix)) {
            return urlOrKey.slice(awsPrefix.length)
        }

        const storageMatch = urlOrKey.match(/\/storage\/(.+)$/)
        if (storageMatch) {
            return storageMatch[1]
        }

        return null
    }
}
