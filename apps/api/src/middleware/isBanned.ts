import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { userCache } from '../utils/cache'

const isBanned = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Login required.',
            })
        }

        const userId = req.userId
        const cacheKey = `user:${userId}:punishment`

        let punishment = await userCache.get<{
            isBanned: boolean
            isTicketBanned: boolean
        }>(cacheKey)

        if (!punishment) {
            const db = getDb()
            const [dbUser] = await db
                .select({
                    isBanned: users.isBanned,
                    isTicketBanned: users.isTicketBanned,
                })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1)
            if (!dbUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.',
                })
            }
            punishment = {
                isBanned: dbUser.isBanned || false,
                isTicketBanned: dbUser.isTicketBanned || false,
            }
            await userCache.set(cacheKey, punishment, 300)
        }

        if (punishment.isBanned) {
            return res.status(403).json({
                success: false,
                message:
                    'Your account has been banned. Please contact support if you believe this is an error.',
            })
        }

        next()
    } catch (error: unknown) {
        logger.error(`Error in isBanned middleware - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export { isBanned }
export default isBanned
