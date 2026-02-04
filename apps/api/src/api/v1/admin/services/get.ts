import { Request, Response } from 'express'
import { getDb, services, users, products } from '@fluxo/db'
import { eq, and, or, ilike, desc, inArray, sql } from '@fluxo/db'
import { ZodError } from 'zod'
import {
    getAllServicesSchema,
    getServiceByIdSchema,
} from '../../../../validators/admin/services/get'
import { logger } from '../../../../utils/logger'
import { serviceCache } from '../../../../utils/cache'

export const getAllServices = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const validated = getAllServicesSchema.parse({ query: req.query })
        const { page, limit, search, status, ownerId } = validated.query

        const cacheKey = `list:v2:${page}:${limit}:${search || 'all'}:${status || 'all'}:${ownerId || 'all'}`
        const cacheGetStart = Date.now()
        const cached = await serviceCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getAllServices - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getAllServices - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const conditions = []

        if (search) {
            const userMatches = await db
                .select({ id: users.id })
                .from(users)
                .where(
                    or(
                        ilike(users.username, `%${search}%`),
                        ilike(users.email, `%${search}%`)
                    )
                )
            const userIds = userMatches.map((u) => u.id)

            const searchConditions = [
                ilike(services.serviceName, `%${search}%`),
                ilike(services.externalId, `%${search}%`),
            ]
            if (userIds.length > 0) {
                searchConditions.push(inArray(services.serviceOwnerId, userIds))
            }
            conditions.push(or(...searchConditions))
        }

        if (status) {
            conditions.push(eq(services.status, status as any))
        }

        if (ownerId) {
            conditions.push(eq(services.serviceOwnerId, ownerId))
        }

        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined

        const totalQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(services)
        const totalResult = whereClause
            ? await totalQuery.where(whereClause)
            : await totalQuery
        const total = Number(totalResult[0]?.count || 0)

        const serviceDocs = whereClause
            ? await db
                  .select()
                  .from(services)
                  .where(whereClause)
                  .orderBy(desc(services.createdAt))
                  .limit(limit)
                  .offset((page - 1) * limit)
            : await db
                  .select()
                  .from(services)
                  .orderBy(desc(services.createdAt))
                  .limit(limit)
                  .offset((page - 1) * limit)

        const ownerIds = [...new Set(serviceDocs.map((s) => s.serviceOwnerId))]
        const owners =
            ownerIds.length > 0
                ? await db
                      .select({
                          id: users.id,
                          email: users.email,
                          username: users.username,
                          firstName: users.firstName,
                          lastName: users.lastName,
                      })
                      .from(users)
                      .where(inArray(users.id, ownerIds))
                : []
        const ownerMap = new Map(owners.map((u) => [u.id, u]))

        const productIds = [
            ...new Set(serviceDocs.map((s) => s.productId).filter(Boolean)),
        ]
        const productsList =
            productIds.length > 0
                ? await db
                      .select({
                          id: products.id,
                          name: products.name,
                      })
                      .from(products)
                      .where(inArray(products.id, productIds))
                : []
        const productMap = new Map(productsList.map((p) => [p.id, p]))

        const transformedServices = serviceDocs.map((service) => {
            const owner = ownerMap.get(service.serviceOwnerId)
            const product = service.productId
                ? productMap.get(service.productId)
                : null
            return {
                ...service,
                uuid: service.id.toString(),
                product: service.productId,
                monthlyPrice: service.monthlyPrice / 100,
                owner: owner
                    ? {
                          id: owner.id,
                          uuid: owner.id.toString(),
                          username: owner.username || null,
                          email: owner.email,
                          name:
                              owner.firstName && owner.lastName
                                  ? `${owner.firstName} ${owner.lastName}`
                                  : null,
                      }
                    : null,
                productName: product?.name || service.productId,
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
        })

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

        const cacheSetStart = Date.now()
        await serviceCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getAllServices - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

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

export const getServiceById = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const validated = getServiceByIdSchema.parse({ params: req.params })
        const serviceId = validated.params.id

        const cacheKey = `id:${serviceId}`
        const cacheGetStart = Date.now()
        const cached = await serviceCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getServiceById - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getServiceById - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [serviceDoc] = await db
            .select()
            .from(services)
            .where(eq(services.id, serviceId))
            .limit(1)

        if (!serviceDoc) {
            return res.status(404).json({
                success: false,
                message: 'Service not found',
            })
        }

        const transformedService = {
            ...serviceDoc,
            uuid: serviceDoc.id.toString(),
            product: serviceDoc.productId,
            monthlyPrice: serviceDoc.monthlyPrice / 100,
            cancelled: {
                isCancelled: serviceDoc.isCancelled,
                cancellationReason: serviceDoc.cancellationReason,
                cancellationDate: serviceDoc.cancellationDate,
            },
            suspended: {
                isSuspended: serviceDoc.isSuspended,
                suspensionReason: serviceDoc.suspensionReason,
                suspensionDate: serviceDoc.suspensionDate,
            },
        }

        const response = {
            success: true,
            message: 'Service fetched successfully',
            service: transformedService,
        }

        const cacheSetStart = Date.now()
        await serviceCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getServiceById - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

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
