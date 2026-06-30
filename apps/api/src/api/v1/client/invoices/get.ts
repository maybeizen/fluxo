import { type Request, type Response } from 'express'
import { getDb, invoices, invoiceItems } from '@fluxo/db'
import { eq, and, desc, sql, inArray } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'
import { parseInvoiceMetadata } from '../../../../utils/invoice-metadata'

export const getMyInvoices = async (req: Request, res: Response) => {
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
        const cached = await invoiceCache.get(cacheKey)

        if (cached) {
            return res.status(200).json(cached)
        }

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

        const invoiceIds = invoicesList.map((inv) => inv.id)
        const allItems =
            invoiceIds.length > 0
                ? await db
                      .select()
                      .from(invoiceItems)
                      .where(inArray(invoiceItems.invoiceId, invoiceIds))
                : []
        const itemsByInvoice = new Map<number, typeof allItems>()
        for (const item of allItems) {
            const list = itemsByInvoice.get(item.invoiceId) ?? []
            list.push(item)
            itemsByInvoice.set(item.invoiceId, list)
        }

        const transformedInvoices = invoicesList.map((inv) => ({
            id: inv.id,
            uuid: inv.id.toString(),
            userId: inv.userId,
            serviceId: inv.serviceId,
            transactionId: inv.transactionId,
            items: itemsByInvoice.get(inv.id) ?? [],
            status: inv.status,
            amount: inv.amount,
            currency: inv.currency,
            metadata: parseInvoiceMetadata(inv.metadata) ?? undefined,
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
        }))

        const response = {
            success: true,
            message: 'Invoices fetched successfully',
            invoices: transformedInvoices,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        await invoiceCache.set(cacheKey, response, 180)

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
        const cached = await invoiceCache.get(cacheKey)
        if (cached) {
            return res.status(200).json(cached)
        }

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
            metadata: parseInvoiceMetadata(invoice.metadata) ?? undefined,
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

        await invoiceCache.set(cacheKey, response, 300)

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting invoice - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
