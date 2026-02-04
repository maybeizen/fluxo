import { Request, Response } from 'express'
import { loginSchema, LoginSchema } from '../../../validators/auth/login'
import { ZodError } from 'zod'
import { logger } from '../../../utils/logger'
import { getSettings } from '../../../utils/get-settings'
import { verifyTurnstileToken } from '../../../utils/turnstile'
import { env } from '../../../utils/env'

export const login = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings()

        if (settings?.auth?.disableLogin) {
            return res.status(403).json({
                success: false,
                message: 'Login is currently disabled.',
            })
        }

        if (req.session.userId) {
            return res.status(400).json({
                success: false,
                message: 'Already authenticated',
            })
        }

        const result: LoginSchema = await loginSchema.parseAsync(req.body)
        const { user, turnstileToken, rememberMe } = result

        if (
            env.NODE_ENV !== 'development' &&
            settings?.security?.cloudflare?.turnstileSiteKey
        ) {
            if (!turnstileToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Cloudflare challenge verification is required',
                })
            }

            const clientIp = req.ip || req.socket.remoteAddress || undefined
            const isValidToken = await verifyTurnstileToken(
                turnstileToken,
                clientIp
            )

            if (!isValidToken) {
                return res.status(400).json({
                    success: false,
                    message:
                        'Cloudflare challenge verification failed. Please try again.',
                })
            }
        }

        req.session.regenerate((err) => {
            if (err) {
                logger.error(`Error during session regeneration - ${err}`)
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                })
            }

            const sessionLifetimeInMs = rememberMe
                ? 30 * 24 * 60 * 60 * 1000
                : env.SESSION_LIFETIME * 24 * 60 * 60 * 1000

            req.session.cookie.maxAge = sessionLifetimeInMs
            req.session.userId = user.id

            req.session.save((saveErr) => {
                if (saveErr) {
                    logger.error(`Error saving session - ${saveErr}`)
                    return res.status(500).json({
                        success: false,
                        message: 'Internal server error',
                    })
                }

                res.status(200).json({
                    success: true,
                    message: 'User logged in successfully',
                    user: {
                        id: user.id,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profile: {
                            username: user.username,
                            slug: user.slug,
                            headline: user.headline,
                            about: user.about,
                            avatarUrl: user.avatarUrl,
                        },
                        role: user.role,
                        isVerified: user.isVerified,
                    },
                })
            })
        })
    } catch (error: unknown) {
        logger.error(`Error during user login - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
