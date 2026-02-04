import { Request, Response } from 'express'
import { getDb, services } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { ZodError } from 'zod'
import { updateMyServiceSchema } from '../../../../validators/client/services/update'
import { logger } from '../../../../utils/logger'
import { serviceCache } from '../../../../utils/cache'

export const updateMyService = async (req: Request, res: Response) => {
    try {
        const validated = updateMyServiceSchema.parse({
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

        const updateData: any = { updatedAt: new Date() }
        if (validated.body.serviceName !== undefined) {
            updateData.serviceName = validated.body.serviceName
        }

        await db
            .update(services)
            .set(updateData)
            .where(eq(services.id, validated.params.id))

        await serviceCache.delPattern('list:*')
        await serviceCache.delPattern(`client:${userId}:*`)
        await serviceCache.del(`id:${validated.params.id}`)

        const [updatedService] = await db
            .select()
            .from(services)
            .where(eq(services.id, validated.params.id))
            .limit(1)

        return res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            service: {
                ...updatedService,
                monthlyPrice: updatedService.monthlyPrice / 100,
            },
        })
    } catch (error: unknown) {
        logger.error(`Error updating service - ${error}`)

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
