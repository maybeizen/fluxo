import { type Request, type Response, type NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../utils/logger'

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            errors: err.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        })
    }

    logger.error(`Unhandled error - ${err}`)
    res.status(500).json({
        success: false,
        message: 'Internal server error',
    })
}
