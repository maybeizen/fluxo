import { Request, Response } from 'express'
import { getDb, services } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { ZodError } from 'zod'
import { updateServiceSchema } from '../../../../validators/admin/services/update'
import { logger } from '../../../../utils/logger'
import { serviceCache } from '../../../../utils/cache'

export const updateService = async (req: Request, res: Response) => {
    try {
        const validated = await updateServiceSchema.parseAsync({
            params: req.params,
            body: req.body,
        })

        const { id } = validated.params
        const { updates } = validated.body

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

        const updateData: any = { updatedAt: new Date() }

        if (updates.serviceName !== undefined)
            updateData.serviceName = updates.serviceName
        if (updates.serviceOwnerId !== undefined)
            updateData.serviceOwnerId = updates.serviceOwnerId
        if (updates.status !== undefined) updateData.status = updates.status
        if (updates.monthlyPrice !== undefined) {
            updateData.monthlyPrice = Math.round(updates.monthlyPrice * 100)
        }
        if (updates.dueDate !== undefined) {
            updateData.dueDate =
                typeof updates.dueDate === 'string'
                    ? new Date(updates.dueDate)
                    : updates.dueDate
        }
        if (updates.creationError !== undefined)
            updateData.creationError = updates.creationError
        if (updates.location !== undefined)
            updateData.location = updates.location
        if (updates.dedicatedIp !== undefined)
            updateData.dedicatedIp = updates.dedicatedIp
        if (updates.proxyAddon !== undefined)
            updateData.proxyAddon = updates.proxyAddon

        if (updates.isCancelled !== undefined)
            updateData.isCancelled = updates.isCancelled
        if (updates.cancellationReason !== undefined) {
            updateData.cancellationReason = updates.cancellationReason || null
        }
        if (updates.cancellationDate !== undefined) {
            updateData.cancellationDate = updates.cancellationDate
                ? typeof updates.cancellationDate === 'string'
                    ? new Date(updates.cancellationDate)
                    : updates.cancellationDate
                : null
        }

        if (updates.isSuspended !== undefined)
            updateData.isSuspended = updates.isSuspended
        if (updates.suspensionReason !== undefined) {
            updateData.suspensionReason = updates.suspensionReason || null
        }
        if (updates.suspensionDate !== undefined) {
            updateData.suspensionDate = updates.suspensionDate
                ? typeof updates.suspensionDate === 'string'
                    ? new Date(updates.suspensionDate)
                    : updates.suspensionDate
                : null
        }

        await db.update(services).set(updateData).where(eq(services.id, id))

        const [updatedService] = await db
            .select()
            .from(services)
            .where(eq(services.id, id))
            .limit(1)

        await serviceCache.delPattern('list:*')
        await serviceCache.del(`id:${id}`)
        await serviceCache.delPattern(`client:${service.serviceOwnerId}:*`)

        const transformedService = {
            ...updatedService,
            uuid: updatedService.id.toString(),
            product: updatedService.productId,
            monthlyPrice: updatedService.monthlyPrice / 100,
            cancelled: {
                isCancelled: updatedService.isCancelled,
                cancellationReason: updatedService.cancellationReason,
                cancellationDate: updatedService.cancellationDate,
            },
            suspended: {
                isSuspended: updatedService.isSuspended,
                suspensionReason: updatedService.suspensionReason,
                suspensionDate: updatedService.suspensionDate,
            },
        }

        return res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            service: transformedService,
        })
    } catch (error: unknown) {
        logger.error(`Error updating service - ${error}`)

        if (error instanceof ZodError) {
            const noUpdatesError = error.issues.find(
                (issue) =>
                    issue.path.includes('updates') &&
                    issue.message === 'No updates provided'
            )

            if (noUpdatesError) {
                return res.status(400).json({
                    success: false,
                    message:
                        'No changes detected. Please modify at least one field.',
                })
            }

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
