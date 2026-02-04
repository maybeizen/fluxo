import { Request, Response } from 'express'
import { getDb, users, userPasswordReset } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { resetPasswordSchema } from '../../../validators/auth/reset-password'
import { env } from '../../../utils/env'
import bcrypt from 'bcrypt'
import { ZodError } from 'zod'
import { logger } from '../../../utils/logger'
import { getSettings } from '../../../utils/get-settings'

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings()

        if (settings?.auth?.disablePasswordChange) {
            return res.status(403).json({
                success: false,
                message: 'Password changes are currently disabled.',
            })
        }

        const { user, newPassword } = await resetPasswordSchema.parseAsync(
            req.body
        )

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token',
            })
        }

        const db = getDb()
        const hashedPassword = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS)

        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, user.id))

        await db
            .delete(userPasswordReset)
            .where(eq(userPasswordReset.userId, user.id))

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error during password reset - ${error}`)

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
