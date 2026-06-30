import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

export const globalRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: 'Too many requests, please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
})

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
        const email =
            typeof req.body?.email === 'string' ? req.body.email : undefined
        return email || ipKeyGenerator(req.ip || 'unknown')
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

export const checkoutRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        success: false,
        message: 'Too many checkout attempts, please try again later.',
    },
    standardHeaders: true,
})

export const couponRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many coupon requests, please try again later.',
    },
    standardHeaders: true,
})

export const uploadRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        message: 'Too many uploads, please try again later.',
    },
    standardHeaders: true,
})

export const webhookRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many webhook requests.',
    },
    standardHeaders: true,
})

export const verifyEmailRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many verification attempts, please try again later.',
    },
    standardHeaders: true,
})
