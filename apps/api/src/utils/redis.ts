import { createRedisClient, RedisClientType } from '@fluxo/redis'
import { env } from './env'
import { logger } from './logger'

const redisUri =
    `redis://:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}` as string

export const redis: RedisClientType = createRedisClient(redisUri)

redis.on('error', (error) => {
    logger.error(`Redis client error - ${error}`, { source: 'Redis' })
})

redis.on('connect', () => {
    logger.info('Redis client connecting...', { source: 'Redis' })
})

redis.on('ready', () => {
    logger.success('Redis client connected and healthy', { source: 'Redis' })
})

redis.on('end', () => {
    logger.warn('Redis client connection closed', { source: 'Redis' })
})

redis.on('reconnecting', () => {
    logger.info('Redis client reconnecting...', { source: 'Redis' })
})
