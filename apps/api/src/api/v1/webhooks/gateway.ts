import { type Request, type Response } from 'express'
import { handleGatewayWebhook } from '../../../plugins/hooks/payment'
import { logger } from '../../../utils/logger'
import { processInvoicePaid } from '../../../utils/process-invoice-paid'

function rawBodyToString(body: unknown): string | null {
    if (typeof body === 'string') return body
    if (Buffer.isBuffer(body)) return body.toString('utf8')
    return null
}

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

    const rawBody = rawBodyToString(req.body)

    try {
        const result = await handleGatewayWebhook(pluginId, {
            body: rawBody ?? req.body,
            headers,
            query: req.query as Record<string, string>,
        })

        if (!result) {
            return res
                .status(404)
                .json({ success: false, message: 'Webhook not handled' })
        }

        if (result.paid) {
            await processInvoicePaid(result.invoiceId)
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
