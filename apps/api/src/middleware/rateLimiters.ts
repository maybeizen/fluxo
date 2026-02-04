import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
    },
    skipSuccessfulRequests: false,
    standardHeaders: true,
})

export const meRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: {
        success: false,
        message: 'Too many requests, please slow down.',
    },
    skipSuccessfulRequests: false,
})

export const emailRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many emails sent, please try again later.',
    },
    skipSuccessfulRequests: false,
    standardHeaders: true,
    keyGenerator: (req) => {
        return req.body?.email || ipKeyGenerator(req.ip || 'unknown')
    },
})

export const profileUpdateRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many profile updates, please try again later.',
    },
    skipSuccessfulRequests: false,
    standardHeaders: true,
})
