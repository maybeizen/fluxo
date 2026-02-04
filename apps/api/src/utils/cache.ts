import { redis } from './redis'
import { logger } from './logger'

export interface CacheOptions {
    ttl?: number
    prefix?: string
}

const DEFAULT_TTL = 300

export class Cache {
    private prefix: string

    constructor(prefix: string = 'cache') {
        this.prefix = prefix
    }

    private getKey(key: string): string {
        return `${this.prefix}:${key}`
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(this.getKey(key))
            if (!data) return null
            return JSON.parse(data) as T
        } catch (error) {
            logger.error(`Cache get error for key ${key} - ${error}`)
            return null
        }
    }

    async set<T>(
        key: string,
        value: T,
        ttl: number = DEFAULT_TTL
    ): Promise<boolean> {
        try {
            await redis.setEx(this.getKey(key), ttl, JSON.stringify(value))
            return true
        } catch (error) {
            logger.error(`Cache set error for key ${key} - ${error}`)
            return false
        }
    }

    async del(key: string): Promise<boolean> {
        try {
            await redis.del([this.getKey(key)])
            return true
        } catch (error) {
            logger.error(`Cache delete error for key ${key} - ${error}`)
            return false
        }
    }

    async delPattern(pattern: string): Promise<boolean> {
        try {
            const keys = await redis.keys(this.getKey(pattern))
            if (keys.length > 0) {
                await redis.del(keys)
            }
            return true
        } catch (error) {
            logger.error(
                `Cache delete pattern error for pattern ${pattern} - ${error}`
            )
            return false
        }
    }

    async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(this.getKey(key))
            return result === 1
        } catch (error) {
            logger.error(`Cache exists error for key ${key} - ${error}`)
            return false
        }
    }

    async ttl(key: string): Promise<number> {
        try {
            return await redis.ttl(this.getKey(key))
        } catch (error) {
            logger.error(`Cache ttl error for key ${key} - ${error}`)
            return -1
        }
    }

    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl: number = DEFAULT_TTL
    ): Promise<T | null> {
        try {
            const cached = await this.get<T>(key)
            if (cached !== null) {
                return cached
            }

            const data = await factory()
            if (data !== null && data !== undefined) {
                await this.set(key, data, ttl)
            }
            return data
        } catch (error) {
            logger.error(`Cache getOrSet error for key ${key} - ${error}`)
            return null
        }
    }
}

export const settingsCache = new Cache('settings')
export const userCache = new Cache('user')
export const productCache = new Cache('product')
export const serviceCache = new Cache('service')
export const newsCache = new Cache('news')
export const couponCache = new Cache('coupon')
export const invoiceCache = new Cache('invoice')
export const ticketCache = new Cache('ticket')
export const pterodactylCache = new Cache('pterodactyl')
