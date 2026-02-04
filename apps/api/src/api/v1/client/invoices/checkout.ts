import { Request, Response } from 'express'
import { checkoutInvoiceSchema } from '../../../../validators/client/invoices/checkout'
import { ZodError } from 'zod'
import { getDb, invoices, invoiceItems } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'
import { InvoiceStatus, PaymentProvider } from '@fluxo/types'
import { getPluginRegistry } from '../../../../plugins/registry'
import { processPaymentWithGateway } from '../../../../plugins/hooks/payment'

export const createInvoiceFromCheckout = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const validated = await checkoutInvoiceSchema.parseAsync(req.body)

        const amountInCents = Math.round(validated.amount * 100)
        const itemsWithCents = validated.items.map((item) => ({
            ...item,
            unitPrice: Math.round(item.unitPrice * 100),
            total: Math.round(item.total * 100),
        }))

        const db = getDb()
        const invoiceValues: Record<string, unknown> = {
            userId,
            serviceId: validated.serviceId || null,
            transactionId: validated.transactionId || null,
            status: InvoiceStatus.PENDING,
            amount: amountInCents,
            currency: validated.currency,
            metadata: validated.metadata
                ? JSON.stringify(validated.metadata)
                : null,
            expiresAt: validated.expiresAt,
        }
        if (validated.gatewayPluginId) {
            invoiceValues.gatewayPluginId = validated.gatewayPluginId
            const registry = getPluginRegistry()
            const gateway = await registry.getGateway(validated.gatewayPluginId)
            if (gateway) {
                invoiceValues.paymentProviderKey =
                    gateway.getPaymentProviderKey()
            }
            invoiceValues.paymentProvider = null
        } else {
            invoiceValues.paymentProvider =
                validated.paymentProvider ?? PaymentProvider.STRIPE
        }

        const [newInvoice] = await db
            .insert(invoices)
            .values(invoiceValues as any)
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
        await invoiceCache.delPattern(`userId:${userId}:*`)

        let paymentResult: {
            redirectUrl?: string
            clientSecret?: string
            transactionId?: string
            completed?: boolean
        } | null = null
        if (validated.gatewayPluginId) {
            try {
                const result = await processPaymentWithGateway({
                    gatewayPluginId: validated.gatewayPluginId,
                    invoiceId: newInvoice.id,
                    amount: amountInCents,
                    currency: validated.currency,
                    userId,
                    returnUrl: validated.returnUrl,
                    cancelUrl: validated.cancelUrl,
                    metadata: validated.metadata,
                })
                if (result) paymentResult = result
            } catch (err) {
                logger.error(`Gateway plugin payment init failed: ${err}`)
            }
        }

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            invoice: {
                ...newInvoice,
                id: newInvoice.id,
            },
            payment: paymentResult ?? undefined,
        })
    } catch (error: unknown) {
        logger.error(`Error creating invoice from checkout - ${error}`)

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
