import { createClient, type RedisClientType as RedisClient } from 'redis'

export type RedisClientType = ReturnType<typeof createClient>

export const createRedisClient = (redisUri?: string): RedisClientType =>
    createClient({ url: redisUri || 'redis://127.0.0.1:6379' })
