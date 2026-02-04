import { getDb, productIntegrations, products, plugins } from '@fluxo/db'
import { eq } from 'drizzle-orm'
import { getPluginRegistry } from '../registry'
import { logger } from '../../utils/logger'
import type { ProvisionServiceResult } from '@fluxo/types'

/**
 * Calls the product's service plugin to provision the resource and returns externalId + optional metadata.
 * Returns null if no service plugin is configured or plugin is disabled.
 */
export async function provisionServiceWithPlugin(input: {
    productId: number
    serviceName: string
    userId: number
    metadata?: Record<string, unknown>
}): Promise<ProvisionServiceResult | null> {
    const db = getDb()
    const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1)
    if (!product) return null

    const [integration] = await db
        .select()
        .from(productIntegrations)
        .where(eq(productIntegrations.productId, input.productId))
        .limit(1)
    if (!integration?.servicePluginId) return null

    const [pluginRow] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, integration.servicePluginId))
        .limit(1)
    if (!pluginRow?.enabled) return null

    const registry = getPluginRegistry()
    const plugin = await registry.getService(integration.servicePluginId)
    if (!plugin) {
        logger.warn(
            `Service plugin ${integration.servicePluginId} not loaded`,
            { source: 'ServiceHooks' }
        )
        return null
    }

    try {
        const result = await plugin.provisionService({
            productId: input.productId,
            productName: product.name,
            serviceName: input.serviceName,
            userId: input.userId,
            pluginConfig:
                (integration.servicePluginConfig as Record<string, unknown>) ??
                {},
            metadata: input.metadata,
        })
        return result
    } catch (err) {
        logger.error(
            `Service plugin ${integration.servicePluginId} provision failed: ${err}`,
            {
                source: 'ServiceHooks',
            }
        )
        throw err
    }
}

/**
 * Updates an existing service via its service plugin. No-op if no plugin or not supported.
 */
export async function updateServiceWithPlugin(input: {
    productId: number
    serviceId: number
    externalId: string
    pluginConfig: Record<string, unknown>
    metadata?: Record<string, unknown>
}): Promise<void> {
    const db = getDb()
    const [integration] = await db
        .select()
        .from(productIntegrations)
        .where(eq(productIntegrations.productId, input.productId))
        .limit(1)
    if (!integration?.servicePluginId) return

    const plugin = await getPluginRegistry().getService(
        integration.servicePluginId
    )
    if (!plugin?.updateService) return

    const [pluginRow] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, integration.servicePluginId))
        .limit(1)
    if (!pluginRow?.enabled) return

    try {
        await plugin.updateService({
            serviceId: input.serviceId,
            externalId: input.externalId,
            productId: input.productId,
            pluginConfig: input.pluginConfig,
            metadata: input.metadata,
        })
    } catch (err) {
        logger.error(
            `Service plugin ${integration.servicePluginId} update failed: ${err}`,
            { source: 'ServiceHooks' }
        )
        throw err
    }
}

/**
 * Suspends a service via its service plugin. No-op if no plugin or not supported.
 */
export async function suspendServiceWithPlugin(
    externalId: string,
    productId: number,
    reason?: string
): Promise<void> {
    const db = getDb()
    const [integration] = await db
        .select()
        .from(productIntegrations)
        .where(eq(productIntegrations.productId, productId))
        .limit(1)
    if (!integration?.servicePluginId) return

    const plugin = await getPluginRegistry().getService(
        integration.servicePluginId
    )
    if (!plugin?.suspendService) return

    const [pluginRow] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, integration.servicePluginId))
        .limit(1)
    if (!pluginRow?.enabled) return

    try {
        await plugin.suspendService(externalId, reason)
    } catch (err) {
        logger.error(
            `Service plugin ${integration.servicePluginId} suspend failed: ${err}`,
            { source: 'ServiceHooks' }
        )
        throw err
    }
}

/**
 * Resumes a suspended service via its service plugin.
 */
export async function resumeServiceWithPlugin(
    externalId: string,
    productId: number
): Promise<void> {
    const db = getDb()
    const [integration] = await db
        .select()
        .from(productIntegrations)
        .where(eq(productIntegrations.productId, productId))
        .limit(1)
    if (!integration?.servicePluginId) return

    const plugin = await getPluginRegistry().getService(
        integration.servicePluginId
    )
    if (!plugin?.resumeService) return

    const [pluginRow] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, integration.servicePluginId))
        .limit(1)
    if (!pluginRow?.enabled) return

    try {
        await plugin.resumeService(externalId)
    } catch (err) {
        logger.error(
            `Service plugin ${integration.servicePluginId} resume failed: ${err}`,
            { source: 'ServiceHooks' }
        )
        throw err
    }
}

/**
 * Deletes/deprovisions a service via its service plugin.
 */
export async function deleteServiceWithPlugin(
    externalId: string,
    productId: number
): Promise<void> {
    const db = getDb()
    const [integration] = await db
        .select()
        .from(productIntegrations)
        .where(eq(productIntegrations.productId, productId))
        .limit(1)
    if (!integration?.servicePluginId) return

    const plugin = await getPluginRegistry().getService(
        integration.servicePluginId
    )
    if (!plugin?.deleteService) return

    const [pluginRow] = await db
        .select()
        .from(plugins)
        .where(eq(plugins.id, integration.servicePluginId))
        .limit(1)
    if (!pluginRow?.enabled) return

    try {
        await plugin.deleteService(externalId)
    } catch (err) {
        logger.error(
            `Service plugin ${integration.servicePluginId} delete failed: ${err}`,
            { source: 'ServiceHooks' }
        )
        throw err
    }
}
