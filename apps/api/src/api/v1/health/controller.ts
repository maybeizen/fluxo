import { type Request, type Response } from 'express'
import { HealthStatus, type HealthResponse } from '@fluxo/types'

export const healthController = (
    req: Request,
    res: Response<HealthResponse>
): void => {
    const response: HealthResponse = {
        status: HealthStatus.OK,
        message: 'Service is healthy',
        timestamp: new Date().toISOString(),
    }

    res.status(200).json(response)
}
