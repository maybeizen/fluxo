export type StorageCategory = 'avatars' | 'logos' | 'tickets'

export type StorageProvider = 'local' | 's3'

export interface StorageSaveResult {
    url: string
    key: string
}

export interface StorageDriver {
    save(
        category: StorageCategory,
        filename: string,
        buffer: Buffer,
        contentType: string
    ): Promise<StorageSaveResult>
    remove(urlOrKey: string): Promise<void>
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
