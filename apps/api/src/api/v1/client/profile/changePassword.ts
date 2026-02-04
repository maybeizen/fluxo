import { Request, Response } from 'express'
import { changePasswordSchema } from '../../../../validators/profile/changePassword'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import bcrypt from 'bcrypt'
import { logger } from '../../../../utils/logger'

export const changePassword = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated',
            })
        }

        const { currentPassword, newPassword } =
            await changePasswordSchema.parseAsync(req.body)

        const db = getDb()
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId))
            .limit(1)

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            })
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        )

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, user.id))

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        })
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        logger.error(`Error changing password - ${error}`)

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
