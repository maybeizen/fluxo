import type { ImageVariantSize } from '../image'

export type StorageCategory = 'avatars' | 'logos' | 'tickets'

export type StorageProvider = 'local' | 's3'

export interface StorageVariant {
    size: ImageVariantSize
    buffer: Buffer
}

export interface StorageDriver {
    saveVariants(baseKey: string, variants: StorageVariant[]): Promise<void>
    resolveUrl(baseKey: string, size: ImageVariantSize): string
    remove(baseKeyOrUrl: string): Promise<void>
}

export interface ResolvedS3Config {
    endpoint?: string
    region: string
    bucket: string
    accessKeyId: string
    secretAccessKey: string
    forcePathStyle?: boolean
    publicUrlBase?: string
}

export interface ResolvedStorageConfig {
    provider: StorageProvider
    storageDir: string
    apiUrl: string
    s3?: ResolvedS3Config
}
