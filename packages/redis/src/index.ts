import { createClient, type RedisClientType as RedisClient } from 'redis'

export type RedisClientType = ReturnType<typeof createClient>

export const createRedisClient = (redisUri?: string): RedisClientType => {
    const uri = redisUri || 'redis://127.0.0.1:6379'
    const client = createClient({ url: uri })

    client.connect().catch((err) => {
        console.error('Redis connection error:', err)
    })
    return client
}
