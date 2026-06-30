import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { StorageCategory, StorageDriver, StorageSaveResult } from './types'

export class LocalStorageDriver implements StorageDriver {
    constructor(
        private readonly storageDir: string,
        private readonly apiUrl: string
    ) {}

    async save(
        category: StorageCategory,
        filename: string,
        buffer: Buffer,
        _contentType: string
    ): Promise<StorageSaveResult> {
        const key = `${category}/${filename}`
        const filePath = join(this.storageDir, category, filename)
        await mkdir(dirname(filePath), { recursive: true })
        await writeFile(filePath, buffer)

        const url = `${this.apiUrl.replace(/\/$/, '')}/storage/${key}`
        return { url, key }
    }

    async remove(urlOrKey: string): Promise<void> {
        const key = this.extractKey(urlOrKey)
        if (!key) return

        const filePath = join(this.storageDir, key)
        try {
            await unlink(filePath)
        } catch {
            // best-effort cleanup
        }
    }

    private extractKey(urlOrKey: string): string | null {
        const storagePrefix = '/storage/'
        const normalizedApiUrl = this.apiUrl.replace(/\/$/, '')

        if (urlOrKey.startsWith(normalizedApiUrl + storagePrefix)) {
            return urlOrKey.slice(
                (normalizedApiUrl + storagePrefix).length
            )
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
