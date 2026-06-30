import { type Request, type Response } from 'express'
import { getDb, invoices } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { InvoiceStatus, PaymentProvider } from '@fluxo/types'
import { ZodError } from 'zod'
import { payInvoiceSchema } from '../../../../validators/client/invoices/pay'
import { processPaymentWithGateway } from '../../../../plugins/hooks/payment'
import { getPluginManager } from '../../../../plugins/manager'
import { logger } from '../../../../utils/logger'
import { parseInvoiceMetadata } from '../../../../utils/invoice-metadata'

function computePayableAmount(invoice: {
    amount: number
    couponCode: string | null
    couponType: string | null
    couponValue: number | null
}): number {
    let discount = 0
    if (
        invoice.couponCode &&
        invoice.couponType &&
        invoice.couponValue != null
    ) {
        if (invoice.couponType === 'percentage') {
            discount = Math.round((invoice.amount * invoice.couponValue) / 100)
        } else {
            discount = Math.round(invoice.couponValue * 100)
        }
    }
    return Math.max(0, invoice.amount - discount)
}

async function resolveGatewayPluginId(input: {
    gatewayPluginId?: string
    paymentProvider?: string
    invoiceGatewayPluginId?: string | null
}): Promise<string | null> {
    if (input.gatewayPluginId) return input.gatewayPluginId
    if (input.invoiceGatewayPluginId) return input.invoiceGatewayPluginId

    const providerKey =
        input.paymentProvider === PaymentProvider.ACCOUNT_BALANCE
            ? null
            : (input.paymentProvider ?? PaymentProvider.STRIPE)

    if (!providerKey) return null

    const registry = getPluginManager()
    const gateways = await registry.getGateways()
    const match = gateways.find(
        (g) => g.getPaymentProviderKey() === providerKey
    )
    return match?.manifest.id ?? null
}

export const payInvoiceHandler = async (req: Request, res: Response) => {
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

        const validated = await payInvoiceSchema.parseAsync(req.body)

        if (validated.paymentProvider === PaymentProvider.ACCOUNT_BALANCE) {
            return res.status(400).json({
                success: false,
                message: 'Account balance payment is not available yet',
            })
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

        if (invoice.status !== InvoiceStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'Only pending invoices can be paid',
            })
        }

        const gatewayPluginId = await resolveGatewayPluginId({
            gatewayPluginId: validated.gatewayPluginId,
            paymentProvider: validated.paymentProvider,
            invoiceGatewayPluginId: invoice.gatewayPluginId,
        })

        if (!gatewayPluginId) {
            return res.status(400).json({
                success: false,
                message: 'No payment gateway available for this invoice',
            })
        }

        const registry = getPluginManager()
        const gateway = await registry.getGateway(gatewayPluginId)
        const paymentProviderKey = gateway?.getPaymentProviderKey()

        if (gatewayPluginId !== invoice.gatewayPluginId) {
            await db
                .update(invoices)
                .set({
                    gatewayPluginId,
                    paymentProviderKey: paymentProviderKey ?? null,
                    updatedAt: new Date(),
                })
                .where(eq(invoices.id, invoiceId))
        }

        const payableAmount = computePayableAmount(invoice)
        const metadata = parseInvoiceMetadata(invoice.metadata) ?? undefined

        let paymentResult: {
            redirectUrl?: string
            clientSecret?: string
            transactionId?: string
            completed?: boolean
        } | null = null

        try {
            const result = await processPaymentWithGateway({
                gatewayPluginId,
                invoiceId: invoice.id,
                amount: payableAmount,
                currency: invoice.currency,
                userId,
                returnUrl: validated.returnUrl,
                cancelUrl: validated.cancelUrl,
                metadata,
            })
            if (result) paymentResult = result
        } catch (err) {
            logger.error(`Gateway plugin payment init failed: ${err}`)
            return res.status(502).json({
                success: false,
                message: 'Payment gateway failed to initialize',
            })
        }

        if (!paymentResult) {
            return res.status(502).json({
                success: false,
                message: 'Payment gateway is unavailable',
            })
        }

        res.status(200).json({
            success: true,
            message: 'Payment initiated',
            payment: paymentResult,
        })
    } catch (error: unknown) {
        logger.error(`Error paying invoice - ${error}`)

        if (error instanceof ZodError) {
            return res.status(400).json({
                success: false,
                errors: error.issues.map((err) => ({
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
