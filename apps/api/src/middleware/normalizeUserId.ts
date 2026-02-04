import { Request, Response, NextFunction } from 'express'

declare global {
    namespace Express {
        interface Request {
            userId?: number
        }
    }
}

/**
 * Middleware that normalizes req.session.userId (string) to req.userId (number)
 * This ensures type safety throughout the application
 */
export const normalizeUserId = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.session?.userId) {
        const userId = parseInt(req.session.userId, 10)
        if (!isNaN(userId)) {
            req.userId = userId
        }
    }
    next()
}

export default normalizeUserId
