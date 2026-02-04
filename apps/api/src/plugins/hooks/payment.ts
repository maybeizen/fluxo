import { getDb, plugins } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import { getPluginRegistry } from '../registry'
import { logger } from '../../utils/logger'
import type { GatewayPaymentRequest, GatewayPaymentResult } from '@fluxo/types'

/**
 * Initiates payment via a gateway plugin. Returns the plugin result (redirect URL, client secret, etc.).
 */
export async function processPaymentWithGateway(input: {
    gatewayPluginId: string
    invoiceId: number
    amount: number
    currency: string
    userId: number
    returnUrl?: string
    cancelUrl?: string
    metadata?: Record<string, unknown>
}): Promise<GatewayPaymentResult | null> {
    const db = getDb()
    const [pluginRow] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, input.gatewayPluginId))
        .limit(1)
    if (!pluginRow?.enabled) {
        logger.warn(`Gateway plugin ${input.gatewayPluginId} is disabled`, {
            source: 'PaymentHooks',
        })
        return null
    }

    const registry = getPluginRegistry()
    const plugin = await registry.getGateway(input.gatewayPluginId)
    if (!plugin) {
        logger.warn(`Gateway plugin ${input.gatewayPluginId} not loaded`, {
            source: 'PaymentHooks',
        })
        return null
    }

    try {
        const result = await plugin.processPayment({
            invoiceId: input.invoiceId,
            amount: input.amount,
            currency: input.currency,
            userId: input.userId,
            returnUrl: input.returnUrl,
            cancelUrl: input.cancelUrl,
            metadata: input.metadata,
        })
        return result
    } catch (err) {
        logger.error(
            `Gateway plugin ${input.gatewayPluginId} processPayment failed: ${err}`,
            {
                source: 'PaymentHooks',
            }
        )
        throw err
    }
}

/**
 * Handles a webhook from a gateway plugin. Returns invoice id and paid status if the payload was handled.
 */
export async function handleGatewayWebhook(
    gatewayPluginId: string,
    payload: {
        body: unknown
        headers: Record<string, string>
        query?: Record<string, string>
    }
): Promise<{ invoiceId: number; paid: boolean } | null> {
    const db = getDb()
    const [pluginRow] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, gatewayPluginId))
        .limit(1)
    if (!pluginRow?.enabled) return null

    const plugin = await getPluginRegistry().getGateway(gatewayPluginId)
    if (!plugin?.handleWebhook) return null

    try {
        return await plugin.handleWebhook(payload)
    } catch (err) {
        logger.error(
            `Gateway plugin ${gatewayPluginId} handleWebhook failed: ${err}`,
            { source: 'PaymentHooks' }
        )
        throw err
    }
}
