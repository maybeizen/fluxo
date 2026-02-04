import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { userCache } from '../utils/cache'
import { getSettings } from '../utils/get-settings'

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Login required.',
            })
        }

        const userId = req.userId
        const cacheKey = `auth:${userId}`

        let user = await userCache.get<{ id: number; isVerified: boolean }>(
            cacheKey
        )

        if (!user) {
            const db = getDb()
            const [dbUser] = await db
                .select({ id: users.id, isVerified: users.isVerified })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1)
            if (!dbUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.',
                })
            }
            user = { id: dbUser.id, isVerified: dbUser.isVerified }
            await userCache.set(cacheKey, user, 300)
        }

        const settings = await getSettings()
        const emailVerificationDisabled =
            settings?.auth?.disableEmailVerification || false

        if (!emailVerificationDisabled && !user.isVerified) {
            return res.status(403).json({
                success: false,
                message:
                    'Please verify your email address to access this resource.',
            })
        }

        next()
    } catch (error: unknown) {
        logger.error(`Error in requireAuth middleware - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export { requireAuth }
export default requireAuth
