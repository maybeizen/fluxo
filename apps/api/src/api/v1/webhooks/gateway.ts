import { Request, Response } from 'express'
import { getDb, invoices } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import { InvoiceStatus } from '@fluxo/types'
import { handleGatewayWebhook } from '../../../plugins/hooks/payment'
import { logger } from '../../../utils/logger'
import { invoiceCache } from '../../../utils/cache'

/**
 * Webhook endpoint for gateway plugins. Gateway (e.g. Stripe) sends payment events here.
 * POST /api/v1/webhooks/gateway/:pluginId
 */
export async function gatewayWebhook(req: Request, res: Response) {
    const pluginId = req.params.pluginId as string
    if (!pluginId) {
        return res
            .status(400)
            .json({ success: false, message: 'Missing plugin id' })
    }

    const headers: Record<string, string> = {}
    for (const [k, v] of Object.entries(req.headers)) {
        if (typeof v === 'string') headers[k] = v
        else if (Array.isArray(v) && v[0]) headers[k] = v[0]
    }

    try {
        const result = await handleGatewayWebhook(pluginId, {
            body: req.body,
            headers,
            query: req.query as Record<string, string>,
        })

        if (!result) {
            return res
                .status(404)
                .json({ success: false, message: 'Webhook not handled' })
        }

        if (result.paid) {
            const db = getDb()
            await db
                .update(invoices)
                .set({
                    status: InvoiceStatus.PAID,
                    paidAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(invoices.id, result.invoiceId))
            await invoiceCache.delPattern('list:*')
            await invoiceCache.delPattern(`userId:*`)
        }

        res.status(200).json({
            success: true,
            invoiceId: result.invoiceId,
            paid: result.paid,
        })
    } catch (err) {
        logger.error(`Gateway webhook ${pluginId} failed: ${err}`)
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed',
        })
    }
}
