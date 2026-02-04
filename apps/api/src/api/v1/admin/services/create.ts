import { Request, Response } from 'express'
import { getDb, services } from '@fluxo/db'
import { ZodError } from 'zod'
import { createServiceSchema } from '../../../../validators/admin/services/create'
import { logger } from '../../../../utils/logger'
import { ServiceStatus } from '@fluxo/types'
import { serviceCache } from '../../../../utils/cache'
import { provisionServiceWithPlugin } from '../../../../plugins/hooks/service'

export const createService = async (req: Request, res: Response) => {
    try {
        const validated = await createServiceSchema.parseAsync({
            body: req.body,
        })
        const serviceData = validated.body

        const dueDate =
            typeof serviceData.dueDate === 'string'
                ? new Date(serviceData.dueDate)
                : serviceData.dueDate

        let externalId = serviceData.externalId || ''
        let creationError = serviceData.creationError ?? false
        try {
            const provisioned = await provisionServiceWithPlugin({
                productId: serviceData.product,
                serviceName: serviceData.serviceName,
                userId: serviceData.serviceOwnerId,
            })
            if (provisioned) externalId = provisioned.externalId
        } catch (err) {
            logger.error(
                `Plugin provision failed for service, creating with empty externalId: ${err}`
            )
            creationError = true
        }

        const db = getDb()
        const [service] = await db
            .insert(services)
            .values({
                productId: serviceData.product,
                serviceName: serviceData.serviceName,
                serviceOwnerId: serviceData.serviceOwnerId,
                externalId,
                status: (serviceData.status ?? ServiceStatus.ACTIVE) as
                    | 'active'
                    | 'suspended'
                    | 'cancelled'
                    | 'deleted',
                monthlyPrice: Math.round(serviceData.monthlyPrice * 100),
                dueDate,
                creationError,
                location: serviceData.location,
                dedicatedIp: serviceData.dedicatedIp ?? false,
                proxyAddon: serviceData.proxyAddon ?? false,
                isCancelled: serviceData.cancelled?.isCancelled ?? false,
                cancellationReason:
                    serviceData.cancelled?.cancellationReason || null,
                cancellationDate: serviceData.cancelled?.cancellationDate
                    ? typeof serviceData.cancelled.cancellationDate === 'string'
                        ? new Date(serviceData.cancelled.cancellationDate)
                        : serviceData.cancelled.cancellationDate
                    : null,
                isSuspended: serviceData.suspended?.isSuspended ?? false,
                suspensionReason:
                    serviceData.suspended?.suspensionReason || null,
                suspensionDate: serviceData.suspended?.suspensionDate
                    ? typeof serviceData.suspended.suspensionDate === 'string'
                        ? new Date(serviceData.suspended.suspensionDate)
                        : serviceData.suspended.suspensionDate
                    : null,
            } as any)
            .returning()

        await serviceCache.delPattern('list:*')
        await serviceCache.delPattern(`client:${serviceData.serviceOwnerId}:*`)

        const transformedService = {
            ...service,
            uuid: service.id.toString(),
            product: service.productId,
            monthlyPrice: service.monthlyPrice / 100,
            cancelled: {
                isCancelled: service.isCancelled,
                cancellationReason: service.cancellationReason,
                cancellationDate: service.cancellationDate,
            },
            suspended: {
                isSuspended: service.isSuspended,
                suspensionReason: service.suspensionReason,
                suspensionDate: service.suspensionDate,
            },
        }

        return res.status(201).json({
            success: true,
            message: 'Service created successfully',
            service: transformedService,
        })
    } catch (error: unknown) {
        logger.error(`Error creating service - ${error}`)

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
