import { Request, Response } from 'express'
import { getDb, users, userEmailVerification } from '@fluxo/db'
import { UserRole } from '@fluxo/types'
import { env } from '../../../utils/env'
import {
    registerSchema,
    RegisterSchema,
} from '../../../validators/auth/register'
import bcrypt from 'bcrypt'
import { ZodError } from 'zod'
import { logger } from '../../../utils/logger'
import { sendEmail } from '../../../utils/mailer'
import {
    emailVerificationTemplate,
    welcomeEmailTemplate,
} from '../../../utils/email-templates'
import { v4 as uuidv4 } from 'uuid'
import { getSettings } from '../../../utils/get-settings'
import { verifyTurnstileToken } from '../../../utils/turnstile'

export const register = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings()

        if (settings?.auth?.disableRegistration) {
            return res.status(403).json({
                success: false,
                message: 'Registration is currently disabled.',
            })
        }

        const parsed = await registerSchema.parseAsync(req.body)
        const { username, email, password, firstName, lastName } = parsed
        const turnstileToken: string | undefined = (
            parsed as Record<string, unknown>
        ).turnstileToken as string | undefined

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

        const db = getDb()
        const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS)

        const emailVerificationDisabled =
            settings?.auth?.disableEmailVerification || false

        const baseSlug = username.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const suffix = Math.floor(Math.random() * 10000)
        const slug = `${baseSlug}-${suffix}`

        if (emailVerificationDisabled) {
            const [newUser] = await db
                .insert(users)
                .values({
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    username,
                    slug,
                    role: UserRole.USER,
                    isVerified: true,
                })
                .returning()

            await sendEmail({
                to: email,
                subject: `Welcome to ${env.APP_NAME}`,
                html: welcomeEmailTemplate(username),
            })

            const { password: _, ...userWithoutPassword } = newUser

            res.status(201).json({
                success: true,
                message: 'User registered successfully. You can now log in.',
                user: {
                    ...userWithoutPassword,
                    profile: {
                        username: newUser.username,
                        slug: newUser.slug,
                        headline: newUser.headline,
                        about: newUser.about,
                        avatarUrl: newUser.avatarUrl,
                    },
                },
            })
        } else {
            const verificationToken = uuidv4()
            const verificationExpiry = new Date(
                Date.now() + 24 * 60 * 60 * 1000
            )

            const [newUser] = await db
                .insert(users)
                .values({
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                    username,
                    slug,
                    role: UserRole.USER,
                    isVerified: false,
                })
                .returning()

            await db.insert(userEmailVerification).values({
                userId: newUser.id,
                token: verificationToken,
                expiresAt: verificationExpiry,
            })

            const verificationLink = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`

            await sendEmail({
                to: email,
                subject: `Verify Your Email - ${env.APP_NAME}`,
                html: emailVerificationTemplate(username, verificationLink),
            })

            const { password: _, ...userWithoutPassword } = newUser

            res.status(201).json({
                success: true,
                message:
                    'User registered successfully. Please check your email to verify your account.',
                user: {
                    ...userWithoutPassword,
                    profile: {
                        username: newUser.username,
                        slug: newUser.slug,
                        headline: newUser.headline,
                        about: newUser.about,
                        avatarUrl: newUser.avatarUrl,
                    },
                },
            })
        }
    } catch (error: unknown) {
        logger.error(`Error during user registration - ${error}`)

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
