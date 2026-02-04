import { Request, Response } from 'express'
import { updateInvoiceSchema } from '../../../../validators/admin/invoices/update'
import { ZodError } from 'zod'
import {
    getDb,
    invoices,
    invoiceItems,
    coupons,
    couponRedemptions,
    services,
} from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache, serviceCache } from '../../../../utils/cache'
import { InvoiceStatus, ServiceStatus } from '@fluxo/types'

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

        if (validated.status !== undefined) {
            updateData.status = validated.status
        }

        if (isBecomingPaid) {
            if (!invoice.paidAt) {
                updateData.paidAt = validated.paidAt || new Date()
            }

            const metadata = invoice.metadata
                ? (JSON.parse(invoice.metadata) as Record<string, unknown>)
                : null

            if (!invoice.serviceId && metadata) {
                const isOneTime = metadata.isOneTime === true

                if (!isOneTime) {
                    const planId = metadata.planId as string
                    const serviceName = metadata.serviceName as string
                    const locationKey = metadata.location as string
                    const dedicatedIP = metadata.dedicatedIP === true
                    const proxySetup = metadata.proxySetup === true

                    if (planId && serviceName && locationKey) {
                        const LOCATION_MAP: Record<string, string> = {
                            'new-york': 'New York',
                            miami: 'Florida',
                            germany: 'Germany',
                            singapore: 'Singapore',
                        }

                        const location =
                            LOCATION_MAP[locationKey] || locationKey

                        let monthlyPrice = invoice.amount
                        if (proxySetup) {
                            monthlyPrice -= 1000
                        }

                        const dueDate = new Date()
                        dueDate.setDate(dueDate.getDate() + 30)

                        const [newService] = await db
                            .insert(services)
                            .values({
                                productId: parseInt(planId),
                                serviceName,
                                serviceOwnerId: invoice.userId,
                                externalId: '',
                                status: ServiceStatus.ACTIVE,
                                monthlyPrice,
                                dueDate,
                                creationError: false,
                                location,
                                dedicatedIp: dedicatedIP,
                                proxyAddon: proxySetup,
                                isCancelled: false,
                                isSuspended: false,
                            })
                            .returning()

                        updateData.serviceId = newService.id

                        await serviceCache.delPattern('list:*')
                        await serviceCache.delPattern(
                            `client:${invoice.userId}:*`
                        )
                    }
                }
            }

            if (invoice.couponCode && !wasPaid) {
                const [coupon] = await db
                    .select()
                    .from(coupons)
                    .where(eq(coupons.code, invoice.couponCode))
                    .limit(1)
                if (coupon) {
                    const redemptionConditions = [
                        eq(couponRedemptions.couponId, coupon.id),
                        eq(couponRedemptions.userId, invoice.userId),
                    ]
                    if (invoice.serviceId) {
                        redemptionConditions.push(
                            eq(couponRedemptions.serviceId, invoice.serviceId)
                        )
                    }
                    const [existingRedemption] = await db
                        .select()
                        .from(couponRedemptions)
                        .where(and(...redemptionConditions))
                        .limit(1)

                    if (!existingRedemption) {
                        await db.insert(couponRedemptions).values({
                            couponId: coupon.id,
                            userId: invoice.userId,
                            serviceId: invoice.serviceId || null,
                        })
                    }
                }
            }
        }

        if (validated.status === InvoiceStatus.EXPIRED && !invoice.expiredAt) {
            updateData.expiredAt = new Date()
        }

        if (validated.amount !== undefined)
            updateData.amount = Math.round(validated.amount * 100)
        if (validated.currency !== undefined)
            updateData.currency = validated.currency
        if (validated.metadata !== undefined)
            updateData.metadata = JSON.stringify(validated.metadata)
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
            metadata: updatedInvoice.metadata
                ? JSON.parse(updatedInvoice.metadata)
                : undefined,
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
