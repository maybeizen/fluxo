import { Request, Response } from 'express'
import { getDb, users, userEmailVerification } from '@fluxo/db'
import { eq, and, gt } from '@fluxo/db'
import { logger } from '../../../utils/logger'
import { ZodError } from 'zod'
import { verifyEmailSchema } from '../../../validators/auth/verify-email'
import { sendEmail } from '../../../utils/mailer'
import { welcomeEmailTemplate } from '../../../utils/email-templates'
import { env } from '../../../utils/env'

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = await verifyEmailSchema.parseAsync(req.query)

        const db = getDb()
        const [emailVerification] = await db
            .select({
                userId: userEmailVerification.userId,
                expiresAt: userEmailVerification.expiresAt,
            })
            .from(userEmailVerification)
            .where(eq(userEmailVerification.token, token))
            .limit(1)

        if (!emailVerification) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token',
            })
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, emailVerification.userId))
            .limit(1)

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification token',
            })
        }

        if (user.isVerified) {
            req.session.userId = user.id.toString()

            return res.status(200).json({
                success: true,
                message: 'Email already verified',
                alreadyVerified: true,
            })
        }

        if (emailVerification.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification token has expired',
                expired: true,
            })
        }

        await db
            .update(users)
            .set({ isVerified: true })
            .where(eq(users.id, user.id))

        await db
            .delete(userEmailVerification)
            .where(eq(userEmailVerification.userId, user.id))

        req.session.userId = user.id.toString()

        await sendEmail({
            to: user.email,
            subject: `Welcome to ${env.APP_NAME}!`,
            html: welcomeEmailTemplate(user.username),
        })

        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error verifying email - ${error}`)

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
