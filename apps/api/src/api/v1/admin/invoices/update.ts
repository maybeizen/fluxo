import { type Request, type Response } from 'express'
import { updateInvoiceSchema } from '../../../../validators/admin/invoices/update'
import { ZodError } from 'zod'
import { getDb, invoices, invoiceItems } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'
import { InvoiceStatus } from '@fluxo/types'
import { processInvoicePaid } from '../../../../utils/process-invoice-paid'
import {
    parseInvoiceMetadata,
    serializeInvoiceMetadata,
} from '../../../../utils/invoice-metadata'

export const updateInvoice = async (req: Request, res: Response) => {
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

        const validated = await updateInvoiceSchema.parseAsync(req.body)

        const updateData: any = { updatedAt: new Date() }
        if (validated.userId !== undefined) updateData.userId = validated.userId
        if (validated.serviceId !== undefined)
            updateData.serviceId = validated.serviceId
        if (validated.transactionId !== undefined)
            updateData.transactionId = validated.transactionId

        const wasPaid = invoice.status === InvoiceStatus.PAID
        const willBePaid =
            validated.status === InvoiceStatus.PAID ||
            (validated.paidAt !== undefined &&
                invoice.status === InvoiceStatus.PAID)
        const isBecomingPaid = willBePaid && !wasPaid && !invoice.paidAt

        if (isBecomingPaid) {
            const paidResult = await processInvoicePaid(invoiceId)
            updateData.status = InvoiceStatus.PAID
            updateData.paidAt = validated.paidAt || new Date()
            if (paidResult.serviceId) {
                updateData.serviceId = paidResult.serviceId
            }
        } else if (validated.status !== undefined) {
            updateData.status = validated.status
        }

        if (validated.status === InvoiceStatus.EXPIRED && !invoice.expiredAt) {
            updateData.expiredAt = new Date()
        }

        if (validated.amount !== undefined)
            updateData.amount = Math.round(validated.amount * 100)
        if (validated.currency !== undefined)
            updateData.currency = validated.currency
        if (validated.metadata !== undefined)
            updateData.metadata = serializeInvoiceMetadata(validated.metadata)
        if (validated.paymentProvider !== undefined)
            updateData.paymentProvider = validated.paymentProvider
        if (validated.expiresAt !== undefined)
            updateData.expiresAt = validated.expiresAt
        if (validated.paidAt !== undefined) updateData.paidAt = validated.paidAt
        if (validated.expiredAt !== undefined)
            updateData.expiredAt = validated.expiredAt

        await db
            .update(invoices)
            .set(updateData)
            .where(eq(invoices.id, invoiceId))

        if (validated.items) {
            await db
                .delete(invoiceItems)
                .where(eq(invoiceItems.invoiceId, invoiceId))

            await db.insert(invoiceItems).values(
                validated.items.map((item) => ({
                    invoiceId,
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: Math.round(item.unitPrice * 100),
                    total: Math.round(item.total * 100),
                }))
            )
        }

        const [updatedInvoice] = await db
            .select()
            .from(invoices)
            .where(eq(invoices.id, invoiceId))
            .limit(1)

        const items = await db
            .select()
            .from(invoiceItems)
            .where(eq(invoiceItems.invoiceId, invoiceId))

        await invoiceCache.delPattern('list:*')
        await invoiceCache.del(`id:${invoiceId}`)
        if (updatedInvoice?.transactionId) {
            await invoiceCache.del(
                `transaction:${updatedInvoice.transactionId}`
            )
        }
        await invoiceCache.delPattern(`userId:${updatedInvoice?.userId}:*`)

        const transformedInvoice = {
            ...updatedInvoice,
            uuid: updatedInvoice.id.toString(),
            items,
            coupon: updatedInvoice.couponCode
                ? {
                      code: updatedInvoice.couponCode,
                      type: updatedInvoice.couponType,
                      value: updatedInvoice.couponValue,
                  }
                : undefined,
            metadata:
                parseInvoiceMetadata(updatedInvoice.metadata) ?? undefined,
            timestamps: {
                createdAt: updatedInvoice.createdAt,
                updatedAt: updatedInvoice.updatedAt,
                paidAt: updatedInvoice.paidAt,
                expiresAt: updatedInvoice.expiresAt,
                expiredAt: updatedInvoice.expiredAt,
            },
        }

        res.status(200).json({
            success: true,
            message: 'Invoice updated successfully',
            invoice: transformedInvoice,
        })
    } catch (error: unknown) {
        logger.error(`Error updating invoice - ${error}`)

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
