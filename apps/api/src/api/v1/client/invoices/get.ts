import { Request, Response } from 'express'
import { getDb, invoices, invoiceItems } from '@fluxo/db'
import { eq, and, desc, sql } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'

export const getMyInvoices = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const status = req.query.status as string

        const cacheKey = `userId:${userId}:${page}:${limit}:${status || 'all'}`
        const cacheGetStart = Date.now()
        const cached = await invoiceCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getMyInvoices - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getMyInvoices - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const conditions = [eq(invoices.userId, userId)]

        if (status) {
            conditions.push(eq(invoices.status, status as any))
        }

        const whereClause = and(...conditions)

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(invoices)
            .where(whereClause)
        const total = Number(totalResult[0]?.count || 0)

        const invoicesList = await db
            .select()
            .from(invoices)
            .where(whereClause)
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(desc(invoices.createdAt))

        const transformedInvoices = await Promise.all(
            invoicesList.map(async (inv) => {
                const items = await db
                    .select()
                    .from(invoiceItems)
                    .where(eq(invoiceItems.invoiceId, inv.id))

                return {
                    id: inv.id,
                    uuid: inv.id.toString(),
                    userId: inv.userId,
                    serviceId: inv.serviceId,
                    transactionId: inv.transactionId,
                    items,
                    status: inv.status,
                    amount: inv.amount,
                    currency: inv.currency,
                    metadata: inv.metadata
                        ? JSON.parse(inv.metadata)
                        : undefined,
                    paymentProvider: inv.paymentProvider,
                    coupon: inv.couponCode
                        ? {
                              code: inv.couponCode,
                              type: inv.couponType,
                              value: inv.couponValue,
                          }
                        : undefined,
                    timestamps: {
                        createdAt: inv.createdAt,
                        updatedAt: inv.updatedAt,
                        paidAt: inv.paidAt,
                        expiresAt: inv.expiresAt,
                        expiredAt: inv.expiredAt,
                    },
                }
            })
        )

        const response = {
            success: true,
            message: 'Invoices fetched successfully',
            invoices: transformedInvoices,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        const cacheSetStart = Date.now()
        await invoiceCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getMyInvoices - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting invoices - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export const getMyInvoiceById = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const invoiceId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(invoiceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID',
            })
        }
        const cacheKey = `userId:${userId}:invoice:${invoiceId}`

        const cacheGetStart = Date.now()
        const cached = await invoiceCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getMyInvoiceById - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getMyInvoiceById - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [invoice] = await db
            .select()
            .from(invoices)
            .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
            .limit(1)

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            })
        }

        const items = await db
            .select()
            .from(invoiceItems)
            .where(eq(invoiceItems.invoiceId, invoice.id))

        const transformedInvoice = {
            id: invoice.id,
            uuid: invoice.id.toString(),
            userId: invoice.userId,
            serviceId: invoice.serviceId,
            transactionId: invoice.transactionId,
            items,
            status: invoice.status,
            amount: invoice.amount,
            currency: invoice.currency,
            metadata: invoice.metadata
                ? JSON.parse(invoice.metadata)
                : undefined,
            paymentProvider: invoice.paymentProvider,
            coupon: invoice.couponCode
                ? {
                      code: invoice.couponCode,
                      type: invoice.couponType,
                      value: invoice.couponValue,
                  }
                : undefined,
            timestamps: {
                createdAt: invoice.createdAt,
                updatedAt: invoice.updatedAt,
                paidAt: invoice.paidAt,
                expiresAt: invoice.expiresAt,
                expiredAt: invoice.expiredAt,
            },
        }

        const response = {
            success: true,
            message: 'Invoice fetched successfully',
            invoice: transformedInvoice,
        }

        const cacheSetStart = Date.now()
        await invoiceCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getMyInvoiceById - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting invoice - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
