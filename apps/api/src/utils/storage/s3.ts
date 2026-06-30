import { createS3Client } from '@fluxo/s3'
import type {
    ResolvedS3Config,
    StorageCategory,
    StorageDriver,
    StorageSaveResult,
} from './types'

export class S3StorageDriver implements StorageDriver {
    private readonly client: ReturnType<typeof createS3Client>

    constructor(private readonly s3Config: ResolvedS3Config) {
        this.client = createS3Client(s3Config)
    }

    async save(
        category: StorageCategory,
        filename: string,
        buffer: Buffer,
        contentType: string
    ): Promise<StorageSaveResult> {
        const key = `${category}/${filename}`
        await this.client.putObject({ key, body: buffer, contentType })
        return { url: this.client.getPublicUrl(key), key }
    }

    async remove(urlOrKey: string): Promise<void> {
        const key = this.extractKey(urlOrKey)
        if (!key) return

        try {
            await this.client.deleteObject(key)
        } catch {
            // best-effort cleanup
        }
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

        return null
    }
}
