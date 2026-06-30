import { type Request, type Response } from 'express'
import { getDb, services } from '@fluxo/db'
import { eq, and, desc, sql } from '@fluxo/db'
import { ZodError } from 'zod'
import {
    getMyServicesSchema,
    getMyServiceByIdSchema,
} from '../../../../validators/client/services/get'
import { logger } from '../../../../utils/logger'
import { serviceCache } from '../../../../utils/cache'

export const getMyServices = async (req: Request, res: Response) => {
    try {
        const validated = getMyServicesSchema.parse({ query: req.query })
        const { page, limit, status } = validated.query

        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const cacheKey = `client:${userId}:${page}:${limit}:${status || 'all'}`
        const cached = await serviceCache.get(cacheKey)

        if (cached) {
            return res.status(200).json(cached)
        }

        const db = getDb()
        const conditions = [eq(services.serviceOwnerId, userId)]

        if (status) {
            conditions.push(eq(services.status, status as any))
        }

        const whereClause = and(...conditions)

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(services)
            .where(whereClause)
        const total = Number(totalResult[0]?.count || 0)

        const servicesList = await db
            .select()
            .from(services)
            .where(whereClause)
            .orderBy(desc(services.createdAt))
            .limit(limit)
            .offset((page - 1) * limit)

        const transformedServices = servicesList.map((s) => ({
            id: s.id,
            uuid: s.id.toString(),
            product: s.productId,
            productId: s.productId,
            serviceName: s.serviceName,
            serviceOwnerId: s.serviceOwnerId,
            externalId: s.externalId,
            status: s.status,
            monthlyPrice: s.monthlyPrice / 100,
            dueDate: s.dueDate,
            creationError: s.creationError,
            location: s.location,
            dedicatedIp: s.dedicatedIp,
            proxyAddon: s.proxyAddon,
            cancelled: {
                isCancelled: s.isCancelled,
                cancellationReason: s.cancellationReason,
                cancellationDate: s.cancellationDate,
            },
            suspended: {
                isSuspended: s.isSuspended,
                suspensionReason: s.suspensionReason,
                suspensionDate: s.suspensionDate,
            },
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }))

        const response = {
            success: true,
            message: 'Services fetched successfully',
            services: transformedServices,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }

        await serviceCache.set(cacheKey, response, 120)

        return res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error fetching services - ${error}`)

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

export const getMyServiceById = async (req: Request, res: Response) => {
    try {
        const validated = getMyServiceByIdSchema.parse({ params: req.params })
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const serviceId = validated.params.id
        const cacheKey = `client:${userId}:${serviceId}`
        const cached = await serviceCache.get(cacheKey)
        if (cached) {
            return res.status(200).json(cached)
        }

        const db = getDb()
        const [service] = await db
            .select()
            .from(services)
            .where(
                and(
                    eq(services.id, serviceId),
                    eq(services.serviceOwnerId, userId)
                )
            )
            .limit(1)

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            })
        }

        const transformedService = {
            id: service.id,
            uuid: service.id.toString(),
            product: service.productId,
            productId: service.productId,
            serviceName: service.serviceName,
            serviceOwnerId: service.serviceOwnerId,
            externalId: service.externalId,
            status: service.status,
            monthlyPrice: service.monthlyPrice / 100,
            dueDate: service.dueDate,
            creationError: service.creationError,
            location: service.location,
            dedicatedIp: service.dedicatedIp,
            proxyAddon: service.proxyAddon,
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
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
        }

        const response = {
            success: true,
            message: 'Service fetched successfully',
            service: transformedService,
        }

        await serviceCache.set(cacheKey, response, 180)

        return res.status(200).json(response)
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        logger.error(`Error fetching service - ${error}`)
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
