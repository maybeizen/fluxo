import { Request, Response } from 'express'
import { getDb, invoices, invoiceItems, users } from '@fluxo/db'
import { eq, and, or, ilike, desc, inArray, sql } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'
import { InvoiceStatus } from '@fluxo/types'

export const getAllInvoices = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const pageParam = Array.isArray(req.query.page)
            ? req.query.page[0]
            : req.query.page
        const limitParam = Array.isArray(req.query.limit)
            ? req.query.limit[0]
            : req.query.limit
        const page =
            parseInt(typeof pageParam === 'string' ? pageParam : '1', 10) || 1
        const limit =
            parseInt(typeof limitParam === 'string' ? limitParam : '10', 10) ||
            10
        const searchParam = Array.isArray(req.query.search)
            ? req.query.search[0]
            : req.query.search
        const statusParam = Array.isArray(req.query.status)
            ? req.query.status[0]
            : req.query.status
        const userIdParam = Array.isArray(req.query.userId)
            ? req.query.userId[0]
            : req.query.userId
        const search = typeof searchParam === 'string' ? searchParam : undefined
        const status = typeof statusParam === 'string' ? statusParam : undefined
        const userId =
            typeof userIdParam === 'string'
                ? parseInt(userIdParam, 10)
                : undefined

        const cacheKey = `list:${page}:${limit}:${search || 'all'}:${status || 'all'}:${userId || 'all'}`
        const cacheGetStart = Date.now()
        const cached = await invoiceCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getAllInvoices - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getAllInvoices - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
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
                ilike(invoices.transactionId, `%${search}%`),
            ]
            if (userIds.length > 0) {
                searchConditions.push(inArray(invoices.userId, userIds))
            }
            conditions.push(or(...searchConditions))
        }

        if (status) {
            conditions.push(eq(invoices.status, status as any))
        }

        if (userId) {
            conditions.push(eq(invoices.userId, userId))
        }

        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined

        const totalResult = whereClause
            ? await db
                  .select({ count: sql<number>`count(*)` })
                  .from(invoices)
                  .where(whereClause)
            : await db.select({ count: sql<number>`count(*)` }).from(invoices)
        const total = Number(totalResult[0]?.count || 0)

        const invoicesList = whereClause
            ? await db
                  .select()
                  .from(invoices)
                  .where(whereClause)
                  .orderBy(desc(invoices.createdAt))
                  .limit(limit)
                  .offset((page - 1) * limit)
            : await db
                  .select()
                  .from(invoices)
                  .orderBy(desc(invoices.createdAt))
                  .limit(limit)
                  .offset((page - 1) * limit)

        const userIds = [...new Set(invoicesList.map((inv) => inv.userId))]
        const usersList =
            userIds.length > 0
                ? await db
                      .select({
                          id: users.id,
                          email: users.email,
                          username: users.username,
                          firstName: users.firstName,
                          lastName: users.lastName,
                      })
                      .from(users)
                      .where(inArray(users.id, userIds))
                : []
        const userMap = new Map(usersList.map((u) => [u.id, u]))

        const invoicesWithUsers = await Promise.all(
            invoicesList.map(async (inv) => {
                const items = await db
                    .select()
                    .from(invoiceItems)
                    .where(eq(invoiceItems.invoiceId, inv.id))

                const user = userMap.get(inv.userId)
                return {
                    ...inv,
                    uuid: inv.id.toString(),
                    items,
                    owner: user
                        ? {
                              id: user.id,
                              uuid: user.id.toString(),
                              username: user.username || null,
                              email: user.email,
                              name:
                                  user.firstName && user.lastName
                                      ? `${user.firstName} ${user.lastName}`
                                      : null,
                          }
                        : null,
                    coupon: inv.couponCode
                        ? {
                              code: inv.couponCode,
                              type: inv.couponType,
                              value: inv.couponValue,
                          }
                        : undefined,
                    metadata: inv.metadata
                        ? JSON.parse(inv.metadata)
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
            invoices: invoicesWithUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        const cacheSetStart = Date.now()
        await invoiceCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getAllInvoices - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
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

export const getInvoiceById = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
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
        const cacheKey = `id:${invoiceId}`

        const cacheGetStart = Date.now()
        const cached = await invoiceCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getInvoiceById - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getInvoiceById - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [invoice] = await db
            .select()
            .from(invoices)
            .where(eq(invoices.id, invoiceId))
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
            ...invoice,
            uuid: invoice.id.toString(),
            items,
            coupon: invoice.couponCode
                ? {
                      code: invoice.couponCode,
                      type: invoice.couponType,
                      value: invoice.couponValue,
                  }
                : undefined,
            metadata: invoice.metadata
                ? JSON.parse(invoice.metadata)
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
            `[Cache SET] getInvoiceById - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
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

export const getInvoiceByTransactionId = async (
    req: Request,
    res: Response
) => {
    const startTime = Date.now()
    try {
        const transactionIdParam = Array.isArray(req.params.transactionId)
            ? req.params.transactionId[0]
            : req.params.transactionId
        if (!transactionIdParam || typeof transactionIdParam !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction ID',
            })
        }
        const transactionId = transactionIdParam
        const cacheKey = `transaction:${transactionId}`

        const cacheGetStart = Date.now()
        const cached = await invoiceCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getInvoiceByTransactionId - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getInvoiceByTransactionId - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [invoice] = await db
            .select()
            .from(invoices)
            .where(eq(invoices.transactionId, transactionId))
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
            ...invoice,
            uuid: invoice.id.toString(),
            items,
            coupon: invoice.couponCode
                ? {
                      code: invoice.couponCode,
                      type: invoice.couponType,
                      value: invoice.couponValue,
                  }
                : undefined,
            metadata: invoice.metadata
                ? JSON.parse(invoice.metadata)
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
            `[Cache SET] getInvoiceByTransactionId - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
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
