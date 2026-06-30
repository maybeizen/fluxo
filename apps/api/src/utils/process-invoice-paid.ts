import {
    getDb,
    invoices,
    coupons,
    couponRedemptions,
    services,
} from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { InvoiceStatus, ServiceStatus } from '@fluxo/types'
import { logger } from './logger'
import { invoiceCache, serviceCache } from './cache'
import { provisionServiceWithPlugin } from '../plugins/hooks/service'
import { getConfigOverridesForInvoice } from './configurable-options'
import { parseInvoiceMetadata } from './invoice-metadata'

const LOCATION_MAP: Record<string, string> = {
    'new-york': 'New York',
    miami: 'Florida',
    germany: 'Germany',
    singapore: 'Singapore',
}

export interface ProcessInvoicePaidResult {
    serviceId?: number
    alreadyPaid: boolean
}

/**
 * Marks an invoice paid and runs provisioning / coupon redemption when newly paid.
 */
export async function processInvoicePaid(
    invoiceId: number
): Promise<ProcessInvoicePaidResult> {
    const db = getDb()
    const [invoice] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, invoiceId))
        .limit(1)

    if (!invoice) {
        throw new Error(`Invoice ${invoiceId} not found`)
    }

    const wasPaid = invoice.status === InvoiceStatus.PAID
    if (wasPaid && invoice.paidAt) {
        return { alreadyPaid: true, serviceId: invoice.serviceId ?? undefined }
    }

    const updateData: Record<string, unknown> = {
        status: InvoiceStatus.PAID,
        paidAt: invoice.paidAt ?? new Date(),
        updatedAt: new Date(),
    }

    const metadata = parseInvoiceMetadata(invoice.metadata)

    if (!invoice.serviceId && metadata) {
        const isOneTime = metadata.isOneTime === true

        if (!isOneTime) {
            const planId = metadata.planId as string
            const serviceName = metadata.serviceName as string
            const locationKey = metadata.location as string
            const dedicatedIP = metadata.dedicatedIP === true
            const proxySetup = metadata.proxySetup === true

            if (planId && serviceName && locationKey) {
                const location = LOCATION_MAP[locationKey] || locationKey

                let monthlyPrice = invoice.amount
                if (proxySetup) {
                    monthlyPrice -= 1000
                }

                const dueDate = new Date()
                dueDate.setDate(dueDate.getDate() + 30)

                const productId = parseInt(planId, 10)
                let externalId = ''
                let creationError = false
                try {
                    const configOverrides =
                        await getConfigOverridesForInvoice(invoiceId)
                    const provisioned = await provisionServiceWithPlugin({
                        productId,
                        serviceName,
                        userId: invoice.userId,
                        configOverrides:
                            Object.keys(configOverrides).length > 0
                                ? configOverrides
                                : undefined,
                    })
                    if (provisioned?.externalId)
                        externalId = provisioned.externalId
                    else creationError = true
                } catch (err) {
                    logger.error(
                        `Provision failed when creating service for paid invoice: ${err}`
                    )
                    creationError = true
                }

                const [newService] = await db
                    .insert(services)
                    .values({
                        productId,
                        serviceName,
                        serviceOwnerId: invoice.userId,
                        externalId,
                        status: ServiceStatus.ACTIVE,
                        monthlyPrice,
                        dueDate,
                        creationError,
                        location,
                        dedicatedIp: dedicatedIP,
                        proxyAddon: proxySetup,
                        isCancelled: false,
                        isSuspended: false,
                    })
                    .returning()

                updateData.serviceId = newService.id

                await serviceCache.delPattern('list:*')
                await serviceCache.delPattern(`client:${invoice.userId}:*`)
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

    await db.update(invoices).set(updateData).where(eq(invoices.id, invoiceId))

    await invoiceCache.delPattern('list:*')
    await invoiceCache.del(`id:${invoiceId}`)
    if (invoice.transactionId) {
        await invoiceCache.del(`transaction:${invoice.transactionId}`)
    }
    await invoiceCache.delPattern(`userId:${invoice.userId}:*`)

    return {
        alreadyPaid: false,
        serviceId:
            (updateData.serviceId as number) ?? invoice.serviceId ?? undefined,
    }
}
