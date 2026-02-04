import { z } from 'zod'
import crypto from 'crypto'
import { getDb, users, userPasswordReset } from '@fluxo/db'
import { eq, and, gt } from '@fluxo/db'

export const resetPasswordSchema = z
    .object({
        token: z.string('Reset token is required'),
        newPassword: z
            .string('New password is required')
            .min(8, 'Password must be at least 8 characters long')
            .max(64, 'Password must be less than 64 characters long')
            .regex(
                /[a-z]/,
                'Password must contain at least one lowercase letter'
            )
            .regex(
                /[A-Z]/,
                'Password must contain at least one uppercase letter'
            )
            .regex(/\d/, 'Password must contain at least one number')
            .regex(
                /[^a-zA-Z0-9]/,
                'Password must contain at least one special character'
            ),
    })
    .superRefine(async (data, ctx) => {
        const hashedToken = crypto
            .createHash('sha256')
            .update(data.token)
            .digest('hex')

        const db = getDb()
        const [passwordReset] = await db
            .select({
                userId: userPasswordReset.userId,
                expiresAt: userPasswordReset.expiresAt,
            })
            .from(userPasswordReset)
            .where(eq(userPasswordReset.token, hashedToken))
            .limit(1)

        if (!passwordReset) {
            ctx.addIssue({
                code: 'custom',
                path: ['token'],
                message: 'Invalid or expired token',
            })
            return
        }

        if (passwordReset.expiresAt < new Date()) {
            ctx.addIssue({
                code: 'custom',
                path: ['token'],
                message: 'Token expired',
            })
            return
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, passwordReset.userId))
            .limit(1)

        if (!user) {
            ctx.addIssue({
                code: 'custom',
                path: ['token'],
                message: 'Invalid or expired token',
            })
            return
        }

        ;(data as any).user = user
    })
    .transform((data) => ({
        ...data,
        user: (data as any).user,
    }))
