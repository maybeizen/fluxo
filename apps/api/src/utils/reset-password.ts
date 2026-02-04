import { UserPasswordReset } from '@fluxo/types'
import crypto from 'crypto'
import { getDb, users, userPasswordReset } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from './logger'

export const generatePasswordResetToken = async (
    email: string
): Promise<UserPasswordReset> => {
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 15)

    const db = getDb()
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

    if (!user) {
        logger.warn(`User not found for password reset - ${email}`)
        throw new Error('User not found for password reset')
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    await db
        .delete(userPasswordReset)
        .where(eq(userPasswordReset.userId, user.id))

    await db.insert(userPasswordReset).values({
        userId: user.id,
        token: hashedToken,
        expiresAt: resetTokenExpiresAt,
    })

    return {
        token: resetToken,
        expiresAt: resetTokenExpiresAt,
    }
}
