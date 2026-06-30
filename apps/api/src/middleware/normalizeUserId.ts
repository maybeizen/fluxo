import { type Request, type Response, type NextFunction } from 'express'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- Express Request augmentation
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
