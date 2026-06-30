import { type Request, type Response, type NextFunction } from 'express'
import { getDb, users } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { UserRole } from '@fluxo/types'
import { getSettings } from '../utils/get-settings'
import { logger } from '../utils/logger'

const ALLOWED_PREFIXES = [
    '/api/v1/auth',
    '/api/v1/public/app-settings',
    '/api/v1/public/turnstile-site-key',
    '/api/v1/health',
    '/api/v1/webhooks',
]

function isAllowedPath(path: string): boolean {
    return ALLOWED_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`)
    )
}

export async function maintenanceGuard(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        if (isAllowedPath(req.path)) {
            return next()
        }

        const settings = await getSettings()
        if (!settings?.system?.maintenanceMode) {
            return next()
        }

        if (req.userId) {
            const db = getDb()
            const [user] = await db
                .select({ role: users.role })
                .from(users)
                .where(eq(users.id, req.userId))
                .limit(1)

            if (user?.role === UserRole.ADMIN) {
                return next()
            }
        }

        return res.status(503).json({
            success: false,
            message: 'Service is under maintenance',
            maintenance: true,
        })
    } catch (error: unknown) {
        logger.error(`Error in maintenanceGuard middleware - ${error}`)
        next()
    }
}
