import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDb, settings } from '@fluxo/db'
import { decrypt } from '../encryption'
import { env } from '../env'
import { LocalStorageDriver } from './local'
import { S3StorageDriver } from './s3'
import type {
    ResolvedS3Config,
    ResolvedStorageConfig,
    StorageDriver,
    StorageProvider,
} from './types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const DEFAULT_STORAGE_DIR = resolve(__dirname, '../../../../storage')

export function resolveStorageDir(): string {
    return env.STORAGE_DIR ? resolve(env.STORAGE_DIR) : DEFAULT_STORAGE_DIR
}

let cachedDriver: StorageDriver | null = null
let cachedConfigKey: string | null = null

type StorageSettings = {
    provider?: StorageProvider
    s3?: {
        endpoint?: string
        region?: string
        bucket?: string
        accessKeyId?: string
        secretAccessKey?: string
        forcePathStyle?: boolean
        publicUrlBase?: string
    }
}

function resolveS3Config(
    dbS3: StorageSettings['s3']
): ResolvedS3Config | undefined {
    const region = dbS3?.region || env.S3_REGION
    const bucket = dbS3?.bucket || env.S3_BUCKET
    const accessKeyId = dbS3?.accessKeyId || env.S3_ACCESS_KEY_ID
    const secretAccessKey = dbS3?.secretAccessKey || env.S3_SECRET_ACCESS_KEY

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
        return undefined
    }

    return {
        endpoint: dbS3?.endpoint || env.S3_ENDPOINT,
        region,
        bucket,
        accessKeyId,
        secretAccessKey,
        forcePathStyle:
            dbS3?.forcePathStyle ?? env.S3_FORCE_PATH_STYLE ?? false,
        publicUrlBase: dbS3?.publicUrlBase || env.S3_PUBLIC_URL_BASE,
    }
}

export async function resolveStorageConfig(): Promise<ResolvedStorageConfig> {
    const db = getDb()
    const [settingsRow] = await db.select().from(settings).limit(1)
    const dbStorage = settingsRow?.storage ?? {}

    let dbS3 = dbStorage.s3
    if (dbS3?.accessKeyId) {
        try {
            dbS3 = {
                ...dbS3,
                accessKeyId: decrypt(dbS3.accessKeyId),
            }
        } catch {
            dbS3 = { ...dbS3, accessKeyId: undefined }
        }
    }
    if (dbS3?.secretAccessKey) {
        try {
            dbS3 = {
                ...dbS3,
                secretAccessKey: decrypt(dbS3.secretAccessKey),
            }
        } catch {
            dbS3 = { ...dbS3, secretAccessKey: undefined }
        }
    }

    const provider: StorageProvider =
        dbStorage.provider || env.STORAGE_PROVIDER || 'local'
    const storageDir = resolveStorageDir()
    const apiUrl = env.API_URL
    const s3 = resolveS3Config(dbS3)

    return { provider, storageDir, apiUrl, s3 }
}

export async function getStorageDriver(): Promise<StorageDriver> {
    const config = await resolveStorageConfig()
    const configKey = JSON.stringify(config)

    if (cachedDriver && cachedConfigKey === configKey) {
        return cachedDriver
    }

    if (config.provider === 's3') {
        if (!config.s3) {
            throw new Error(
                'S3 storage is configured but required credentials are missing'
            )
        }
        cachedDriver = new S3StorageDriver(config.s3)
    } else {
        cachedDriver = new LocalStorageDriver(config.storageDir, config.apiUrl)
    }

    cachedConfigKey = configKey
    return cachedDriver
}

export function invalidateStorageDriver(): void {
    cachedDriver = null
    cachedConfigKey = null
}

export type {
    StorageCategory,
    StorageDriver,
    StorageProvider,
    ResolvedStorageConfig,
} from './types'
