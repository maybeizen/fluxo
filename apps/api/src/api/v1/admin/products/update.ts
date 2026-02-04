import { Request, Response } from 'express'
import { updateProductSchema } from '../../../../validators/admin/products/update'
import { ZodError } from 'zod'
import { getDb, products, productIntegrations } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { productCache } from '../../../../utils/cache'

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const productId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
            })
        }
        const db = getDb()

        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            })
        }

        const validated = await updateProductSchema.parseAsync(req.body)

        const updateData: any = {}

        if (validated.metadata) {
            if (validated.metadata.name !== undefined)
                updateData.name = validated.metadata.name
            if (validated.metadata.description !== undefined)
                updateData.description = validated.metadata.description
            if (validated.metadata.price !== undefined) {
                updateData.price = Math.round(validated.metadata.price * 100)
            }
            if (validated.metadata.tags !== undefined)
                updateData.tags = validated.metadata.tags
        }

        if (validated.specifications) {
            if (validated.specifications.cpu !== undefined)
                updateData.cpu = validated.specifications.cpu
            if (validated.specifications.ram !== undefined)
                updateData.ram = validated.specifications.ram
            if (validated.specifications.storage !== undefined)
                updateData.storage = validated.specifications.storage
            if (validated.specifications.ports !== undefined)
                updateData.ports = validated.specifications.ports
            if (validated.specifications.databases !== undefined)
                updateData.databases = validated.specifications.databases
            if (validated.specifications.backups !== undefined)
                updateData.backups = validated.specifications.backups
        }

        if (validated.status) {
            if (validated.status.hidden !== undefined)
                updateData.hidden = validated.status.hidden
            if (validated.status.disabled !== undefined)
                updateData.disabled = validated.status.disabled
            if (validated.status.allowCoupons !== undefined)
                updateData.allowCoupons = validated.status.allowCoupons
        }

        if (validated.stock) {
            if (validated.stock.stockEnabled !== undefined)
                updateData.stockEnabled = validated.stock.stockEnabled
            if (validated.stock.stock !== undefined)
                updateData.stock = validated.stock.stock
        }

        if (validated.category !== undefined) {
            updateData.categoryId = validated.category
        }

        if (validated.order !== undefined) {
            updateData.order = validated.order
        }

        updateData.updatedAt = new Date()

        await db
            .update(products)
            .set(updateData)
            .where(eq(products.id, productId))

        if (validated.integrations !== undefined) {
            const hasPterodactyl = validated.integrations.pterodactyl
            const hasServicePlugin =
                validated.integrations.servicePluginId !== undefined &&
                validated.integrations.servicePluginId !== null &&
                validated.integrations.servicePluginId.length > 0

            if (
                hasPterodactyl ||
                hasServicePlugin ||
                validated.integrations.servicePluginId === null
            ) {
                const [existingIntegration] = await db
                    .select()
                    .from(productIntegrations)
                    .where(eq(productIntegrations.productId, productId))
                    .limit(1)

                const integrationData: Record<string, unknown> = {
                    productId,
                    enabled: hasPterodactyl
                        ? (validated.integrations.pterodactyl!.enabled ?? false)
                        : true,
                }
                if (hasPterodactyl) {
                    integrationData.oomKiller =
                        validated.integrations.pterodactyl!.oomKiller ?? false
                    integrationData.skipEggInstallScript =
                        validated.integrations.pterodactyl!
                            .skipEggInstallScript ?? false
                    integrationData.startOnCompletion =
                        validated.integrations.pterodactyl!.startOnCompletion ??
                        true
                    if (
                        validated.integrations.pterodactyl!.locationId !==
                        undefined
                    )
                        integrationData.locationId =
                            validated.integrations.pterodactyl!.locationId
                    if (
                        validated.integrations.pterodactyl!.nodeId !== undefined
                    )
                        integrationData.nodeId =
                            validated.integrations.pterodactyl!.nodeId
                    if (
                        validated.integrations.pterodactyl!.nestId !== undefined
                    )
                        integrationData.nestId =
                            validated.integrations.pterodactyl!.nestId
                    if (validated.integrations.pterodactyl!.eggId !== undefined)
                        integrationData.eggId =
                            validated.integrations.pterodactyl!.eggId
                    if (
                        validated.integrations.pterodactyl!.memory !== undefined
                    )
                        integrationData.memory =
                            validated.integrations.pterodactyl!.memory
                    if (validated.integrations.pterodactyl!.swap !== undefined)
                        integrationData.swap =
                            validated.integrations.pterodactyl!.swap
                    if (validated.integrations.pterodactyl!.disk !== undefined)
                        integrationData.disk =
                            validated.integrations.pterodactyl!.disk
                    if (validated.integrations.pterodactyl!.io !== undefined)
                        integrationData.io =
                            validated.integrations.pterodactyl!.io
                    if (validated.integrations.pterodactyl!.cpu !== undefined)
                        integrationData.cpu =
                            validated.integrations.pterodactyl!.cpu
                    if (
                        validated.integrations.pterodactyl!.cpuPinning !==
                        undefined
                    )
                        integrationData.cpuPinning =
                            validated.integrations.pterodactyl!.cpuPinning
                    if (
                        validated.integrations.pterodactyl!.databases !==
                        undefined
                    )
                        integrationData.databases =
                            validated.integrations.pterodactyl!.databases
                    if (
                        validated.integrations.pterodactyl!.backups !==
                        undefined
                    )
                        integrationData.backups =
                            validated.integrations.pterodactyl!.backups
                    if (
                        validated.integrations.pterodactyl!
                            .additionalAllocations !== undefined
                    )
                        integrationData.additionalAllocations =
                            validated.integrations.pterodactyl!.additionalAllocations
                } else if (
                    !hasServicePlugin &&
                    validated.integrations.servicePluginId === null
                ) {
                    integrationData.enabled = false
                }
                if (validated.integrations.servicePluginId !== undefined)
                    integrationData.servicePluginId =
                        validated.integrations.servicePluginId
                if (validated.integrations.servicePluginConfig !== undefined)
                    integrationData.servicePluginConfig =
                        validated.integrations.servicePluginConfig

                if (existingIntegration) {
                    await db
                        .update(productIntegrations)
                        .set(integrationData as any)
                        .where(eq(productIntegrations.productId, productId))
                } else {
                    await db
                        .insert(productIntegrations)
                        .values(integrationData as any)
                }
            } else if (!hasPterodactyl && !hasServicePlugin) {
                await db
                    .delete(productIntegrations)
                    .where(eq(productIntegrations.productId, productId))
            }
        }

        await productCache.delPattern('list:*')
        await productCache.del(`id:${productId}`)

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error updating product - ${error}`)

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
