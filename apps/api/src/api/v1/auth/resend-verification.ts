import { Request, Response } from 'express'
import { getDb, users, userEmailVerification } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../utils/logger'
import { ZodError } from 'zod'
import { resendVerificationSchema } from '../../../validators/auth/resend-verification'
import { sendEmail } from '../../../utils/mailer'
import { emailVerificationTemplate } from '../../../utils/email-templates'
import { env } from '../../../utils/env'
import { v4 as uuidv4 } from 'uuid'
import { getSettings } from '../../../utils/get-settings'

export const resendVerification = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings()

        if (settings?.auth?.disableEmailVerification) {
            return res.status(400).json({
                success: false,
                message: 'Email verification is currently disabled.',
            })
        }

        const { email } = await resendVerificationSchema.parseAsync(req.body)

        const db = getDb()
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified',
            })
        }

        const verificationToken = uuidv4()
        const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await db
            .delete(userEmailVerification)
            .where(eq(userEmailVerification.userId, user.id))

        await db.insert(userEmailVerification).values({
            userId: user.id,
            token: verificationToken,
            expiresAt: verificationExpiry,
        })

        const verificationLink = `${env.FRONTEND_URL}/auth/verify-email?token=${verificationToken}`

        await sendEmail({
            to: email,
            subject: `Verify Your Email - ${env.APP_NAME}`,
            html: emailVerificationTemplate(user.username, verificationLink),
        })

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error resending verification email - ${error}`)

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
