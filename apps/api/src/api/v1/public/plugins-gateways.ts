import type { Request, Response } from 'express'
import { getDb, plugins } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import { getPluginRegistry } from '../../../plugins/registry'

/**
 * Returns enabled gateway plugins for checkout. No auth required.
 */
export async function getGatewayPlugins(_req: Request, res: Response) {
    try {
        const registry = getPluginRegistry()
        const gateways = await registry.getGateways()
        const db = getDb()
        const list = []
        for (const g of gateways) {
            const [row] = await db
                .select()
                .from(plugins)
                .where(eq(plugins.id, g.manifest.id))
                .limit(1)
            if (!row?.enabled) continue
            list.push({
                id: g.manifest.id,
                name: g.manifest.name,
                paymentProviderKey: g.getPaymentProviderKey(),
            })
        }
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
