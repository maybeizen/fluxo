import { type Request, type Response, type NextFunction } from 'express'
import { getSettings } from '../utils/get-settings'
import { logger } from '../utils/logger'

export async function requireTicketsEnabled(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const settings = await getSettings()
        if (settings?.system?.ticketsEnabled === false) {
            return res.status(403).json({
                success: false,
                message: 'Support tickets are currently disabled',
            })
        }
        next()
    } catch (error: unknown) {
        logger.error(`Error in requireTicketsEnabled middleware - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
