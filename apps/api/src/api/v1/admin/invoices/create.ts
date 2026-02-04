import { Request, Response } from 'express'
import { createInvoiceSchema } from '../../../../validators/admin/invoices/create'
import { ZodError } from 'zod'
import { getDb, invoices, invoiceItems, services } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'
import { InvoiceStatus } from '@fluxo/types'

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const validated = await createInvoiceSchema.parseAsync(req.body)

        const amountInCents = Math.round(validated.amount * 100)
        const itemsWithCents = validated.items.map((item) => ({
            ...item,
            unitPrice: Math.round(item.unitPrice * 100),
            total: Math.round(item.total * 100),
        }))

        let expiresAt: Date
        const now = new Date()

        const db = getDb()
        if (validated.expiresAt) {
            expiresAt = new Date(validated.expiresAt)
            expiresAt.setHours(23, 59, 59, 999)
        } else if (validated.serviceId) {
            const [service] = await db
                .select()
                .from(services)
                .where(eq(services.id, validated.serviceId))
                .limit(1)
            if (!service) {
                return res.status(400).json({
                    success: false,
                    message: 'Service not found',
                })
            }
            expiresAt = new Date(service.dueDate)
            expiresAt.setDate(expiresAt.getDate() + 7)
            expiresAt.setHours(23, 59, 59, 999)
        } else {
            expiresAt = new Date(now)
            expiresAt.setDate(expiresAt.getDate() + 3)
            expiresAt.setHours(23, 59, 59, 999)
        }

        const invoiceValues: any = {
            userId: validated.userId,
            serviceId: validated.serviceId || null,
            transactionId: validated.transactionId || null,
            status: validated.status,
            amount: amountInCents,
            currency: validated.currency,
            metadata: validated.metadata
                ? JSON.stringify(validated.metadata)
                : null,
            expiresAt,
        }
        if (validated.paymentProvider) {
            invoiceValues.paymentProvider = validated.paymentProvider
        }

        const [newInvoice] = await db
            .insert(invoices)
            .values(invoiceValues)
            .returning()

        await db.insert(invoiceItems).values(
            itemsWithCents.map((item) => ({
                invoiceId: newInvoice.id,
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total,
            }))
        )

        await invoiceCache.delPattern('list:*')
        await invoiceCache.delPattern(`userId:${validated.userId}:*`)

        const items = await db
            .select()
            .from(invoiceItems)
            .where(eq(invoiceItems.invoiceId, newInvoice.id))

        const transformedInvoice = {
            ...newInvoice,
            uuid: newInvoice.id.toString(),
            items,
            coupon: newInvoice.couponCode
                ? {
                      code: newInvoice.couponCode,
                      type: newInvoice.couponType,
                      value: newInvoice.couponValue,
                  }
                : undefined,
            metadata: newInvoice.metadata
                ? JSON.parse(newInvoice.metadata)
                : undefined,
            timestamps: {
                createdAt: newInvoice.createdAt,
                updatedAt: newInvoice.updatedAt,
                paidAt: newInvoice.paidAt,
                expiresAt: newInvoice.expiresAt,
                expiredAt: newInvoice.expiredAt,
            },
        }

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            invoice: transformedInvoice,
        })
    } catch (error: unknown) {
        logger.error(`Error creating invoice - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err: any) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            })
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
