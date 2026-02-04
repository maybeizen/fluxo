import { Request, Response } from 'express'
import { getDb, services } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import { deleteServiceSchema } from '../../../../validators/admin/services/delete'
import { logger } from '../../../../utils/logger'
import { serviceCache } from '../../../../utils/cache'

export const deleteService = async (req: Request, res: Response) => {
    try {
        const validated = await deleteServiceSchema.parseAsync({
            params: req.params,
        })
        const { id } = validated.params

        const db = getDb()
        const [service] = await db
            .select()
            .from(services)
            .where(eq(services.id, id))
            .limit(1)

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            })
        }

        const serviceOwnerId = service.serviceOwnerId
        await db.delete(services).where(eq(services.id, id))

        await serviceCache.delPattern('list:*')
        await serviceCache.del(`id:${id}`)
        await serviceCache.delPattern(`client:${serviceOwnerId}:*`)

        return res.status(200).json({
            success: true,
            message: 'Service deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting service - ${error}`)

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
