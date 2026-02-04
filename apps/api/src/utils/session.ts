import session from 'express-session'
import { RedisStore } from 'connect-redis'
import { redis } from './redis'
import { env } from './env'
import { Handler } from 'express'

const cookieLifetimeInMs = env.SESSION_LIFETIME * 24 * 60 * 60 * 1000

const redisStore = new RedisStore({
    client: redis,
    prefix: 'session:',
    ttl: Math.floor(cookieLifetimeInMs / 1000),
})

export const sessionMiddleware: Handler = session({
    proxy: process.env.NODE_ENV === 'production',
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: redisStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: cookieLifetimeInMs,
        httpOnly: true,
        sameSite: 'lax',
    },
})
