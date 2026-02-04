import { Request, Response } from 'express'
import { getDb, services } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { ServiceStatus } from '@fluxo/types'
import { ZodError } from 'zod'
import { cancelMyServiceSchema } from '../../../../validators/client/services/cancel'
import { logger } from '../../../../utils/logger'

export const cancelMyService = async (req: Request, res: Response) => {
    try {
        const validated = cancelMyServiceSchema.parse({
            params: req.params,
            body: req.body,
        })
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const db = getDb()
        const [serviceDoc] = await db
            .select()
            .from(services)
            .where(
                and(
                    eq(services.id, validated.params.id),
                    eq(services.serviceOwnerId, userId)
                )
            )
            .limit(1)

        if (!serviceDoc) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            })
        }

        if (serviceDoc.status !== ServiceStatus.ACTIVE) {
            return res.status(400).json({
                success: false,
                message: 'Only active services can be cancelled',
            })
        }

        if (serviceDoc.creationError) {
            return res.status(400).json({
                success: false,
                message:
                    'Services with creation errors cannot be cancelled through this method',
            })
        }

        await db
            .update(services)
            .set({
                status: ServiceStatus.CANCELLED,
                isCancelled: true,
                cancellationReason: validated.body.cancellationReason,
                cancellationDate: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(services.id, validated.params.id))

        const [updatedService] = await db
            .select()
            .from(services)
            .where(eq(services.id, validated.params.id))
            .limit(1)

        return res.status(200).json({
            success: true,
            message: 'Service cancelled successfully',
            service: {
                ...updatedService,
                monthlyPrice: updatedService.monthlyPrice / 100,
            },
        })
    } catch (error: unknown) {
        logger.error(`Error cancelling service - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
