import { createRedisClient } from '@fluxo/redis'
import { loadEnv } from './env.js'

const SETTINGS_CACHE_KEYS = [
    'settings:global',
    'settings:global:minimal',
    'settings:public:app-settings',
]

function resolveRedisUri(): string {
    loadEnv()
    const password = process.env.REDIS_PASSWORD
    const host = process.env.REDIS_HOST || '127.0.0.1'
    const port = process.env.REDIS_PORT || '6379'

    if (password && password !== 'null') {
        return `redis://:${password}@${host}:${port}`
    }
    return `redis://${host}:${port}`
}

export async function flushSettingsCache(): Promise<void> {
    const client = createRedisClient(resolveRedisUri())
    try {
        await client.connect()
        await client.del(SETTINGS_CACHE_KEYS)
    } catch {
        // Redis may be unavailable during local CLI-only operations
    } finally {
        if (client.isOpen) {
            await client.quit()
        }
    }
}
