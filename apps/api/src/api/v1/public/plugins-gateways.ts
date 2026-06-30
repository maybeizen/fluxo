import type { Request, Response } from 'express'
import { getDb, plugins } from '@fluxo/db'
import { getPluginManager } from '../../../plugins/manager'
import type { FluxoGatewayPlugin } from '@fluxo/forge'

/**
 * Returns enabled gateway plugins for checkout. No auth required.
 */
export async function getGatewayPlugins(_req: Request, res: Response) {
    try {
        const registry = getPluginManager()
        const gateways: FluxoGatewayPlugin[] = await registry.getGateways()
        const db = getDb()
        const dbRows = await db.select().from(plugins)
        const enabledById = new Map(
            dbRows.map((r) => [r.id, r.enabled ?? true])
        )

        const list = gateways
            .filter((g) => enabledById.get(g.manifest.id) !== false)
            .map((g) => ({
                id: g.manifest.id,
                name: g.manifest.name,
                paymentProviderKey: g.getPaymentProviderKey(),
            }))

        res.status(200).json({ success: true, gateways: list })
    } catch (error: unknown) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : 'Failed to list gateway plugins',
        })
    }
}
