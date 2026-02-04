import { Request, Response, NextFunction } from 'express'
import { getDb, users, eq } from '@fluxo/db'
import { UserRole } from '@fluxo/types'
import { logger } from '../utils/logger'

const requireAdminOnly = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated.',
            })
        }

        const db = getDb()
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, req.userId))
            .limit(1)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthenticated.',
            })
        }
        if (user.role !== UserRole.ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized. Admin access required.',
            })
        }
        next()
    } catch (error: unknown) {
        logger.error(`Error in requireAdminOnly middleware - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export { requireAdminOnly }
export default requireAdminOnly
