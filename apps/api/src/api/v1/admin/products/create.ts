import { Request, Response } from 'express'
import { createProductSchema } from '../../../../validators/admin/products/create'
import { ZodError } from 'zod'
import { getDb, products, productIntegrations } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { productCache } from '../../../../utils/cache'

export const createProduct = async (req: Request, res: Response) => {
    try {
        const validated = await createProductSchema.parseAsync(req.body)

        const priceInCents = Math.round(validated.metadata.price * 100)

        const db = getDb()
        const [newProduct] = await db
            .insert(products)
            .values({
                name: validated.metadata.name,
                description: validated.metadata.description,
                price: priceInCents,
                tags: validated.metadata.tags || [],
                cpu: validated.specifications.cpu,
                ram: validated.specifications.ram,
                storage: validated.specifications.storage,
                ports: validated.specifications.ports,
                databases: validated.specifications.databases,
                backups: validated.specifications.backups,
                hidden: validated.status.hidden,
                disabled: validated.status.disabled,
                allowCoupons: validated.status.allowCoupons,
                stockEnabled: validated.stock.stockEnabled,
                stock: validated.stock.stock,
                categoryId: validated.category ?? null,
                order: validated.order ?? 0,
            })
            .returning()

        const hasPterodactyl = validated.integrations?.pterodactyl
        const hasServicePlugin =
            validated.integrations?.servicePluginId &&
            validated.integrations.servicePluginId.length > 0
        if (hasPterodactyl || hasServicePlugin) {
            const integrationData: Record<string, unknown> = {
                productId: newProduct.id,
                enabled: hasPterodactyl
                    ? (validated.integrations!.pterodactyl!.enabled ?? false)
                    : true,
            }
            if (hasPterodactyl) {
                integrationData.oomKiller =
                    validated.integrations!.pterodactyl!.oomKiller ?? false
                integrationData.skipEggInstallScript =
                    validated.integrations!.pterodactyl!.skipEggInstallScript ??
                    false
                integrationData.startOnCompletion =
                    validated.integrations!.pterodactyl!.startOnCompletion ??
                    true
                if (
                    validated.integrations!.pterodactyl!.locationId !==
                    undefined
                )
                    integrationData.locationId =
                        validated.integrations!.pterodactyl!.locationId
                if (validated.integrations!.pterodactyl!.nodeId !== undefined)
                    integrationData.nodeId =
                        validated.integrations!.pterodactyl!.nodeId
                if (validated.integrations!.pterodactyl!.nestId !== undefined)
                    integrationData.nestId =
                        validated.integrations!.pterodactyl!.nestId
                if (validated.integrations!.pterodactyl!.eggId !== undefined)
                    integrationData.eggId =
                        validated.integrations!.pterodactyl!.eggId
                if (validated.integrations!.pterodactyl!.memory !== undefined)
                    integrationData.memory =
                        validated.integrations!.pterodactyl!.memory
                if (validated.integrations!.pterodactyl!.swap !== undefined)
                    integrationData.swap =
                        validated.integrations!.pterodactyl!.swap
                if (validated.integrations!.pterodactyl!.disk !== undefined)
                    integrationData.disk =
                        validated.integrations!.pterodactyl!.disk
                if (validated.integrations!.pterodactyl!.io !== undefined)
                    integrationData.io = validated.integrations!.pterodactyl!.io
                if (validated.integrations!.pterodactyl!.cpu !== undefined)
                    integrationData.cpu =
                        validated.integrations!.pterodactyl!.cpu
                if (
                    validated.integrations!.pterodactyl!.cpuPinning !==
                    undefined
                )
                    integrationData.cpuPinning =
                        validated.integrations!.pterodactyl!.cpuPinning
            }
            if (hasPterodactyl) {
                if (
                    validated.integrations!.pterodactyl!.databases !== undefined
                )
                    integrationData.databases =
                        validated.integrations!.pterodactyl!.databases
                if (validated.integrations!.pterodactyl!.backups !== undefined)
                    integrationData.backups =
                        validated.integrations!.pterodactyl!.backups
                if (
                    validated.integrations!.pterodactyl!
                        .additionalAllocations !== undefined
                )
                    integrationData.additionalAllocations =
                        validated.integrations!.pterodactyl!.additionalAllocations
            }
            if (hasServicePlugin) {
                integrationData.servicePluginId =
                    validated.integrations!.servicePluginId
                integrationData.servicePluginConfig =
                    validated.integrations!.servicePluginConfig ?? null
            }
            await db.insert(productIntegrations).values(integrationData as any)
        }

        await productCache.delPattern('list:*')

        const [integration] = validated.integrations?.pterodactyl
            ? await db
                  .select()
                  .from(productIntegrations)
                  .where(eq(productIntegrations.productId, newProduct.id))
                  .limit(1)
            : [null]

        const transformedProduct = {
            id: newProduct.id,
            uuid: newProduct.id.toString(),
            metadata: {
                name: newProduct.name,
                description: newProduct.description,
                price: newProduct.price,
                tags: newProduct.tags || [],
            },
            specifications: {
                cpu: newProduct.cpu,
                ram: newProduct.ram,
                storage: newProduct.storage,
                ports: newProduct.ports,
                databases: newProduct.databases,
                backups: newProduct.backups,
            },
            status: {
                hidden: newProduct.hidden,
                disabled: newProduct.disabled,
                allowCoupons: newProduct.allowCoupons,
            },
            stock: {
                stockEnabled: newProduct.stockEnabled,
                stock: newProduct.stock,
            },
            category: newProduct.categoryId,
            order: newProduct.order,
            integrations: integration
                ? {
                      pterodactyl: {
                          enabled: integration.enabled,
                          locationId: integration.locationId,
                          nodeId: integration.nodeId,
                          nestId: integration.nestId,
                          eggId: integration.eggId,
                          memory: integration.memory,
                          swap: integration.swap,
                          disk: integration.disk,
                          io: integration.io,
                          cpu: integration.cpu,
                          cpuPinning: integration.cpuPinning,
                          databases: integration.databases,
                          backups: integration.backups,
                          additionalAllocations:
                              integration.additionalAllocations,
                          oomKiller: integration.oomKiller,
                          skipEggInstallScript:
                              integration.skipEggInstallScript,
                          startOnCompletion: integration.startOnCompletion,
                      },
                      servicePluginId: integration.servicePluginId ?? undefined,
                      servicePluginConfig:
                          integration.servicePluginConfig ?? undefined,
                  }
                : undefined,
            timestamps: {
                createdAt: newProduct.createdAt,
                updatedAt: newProduct.updatedAt,
            },
        }

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product: transformedProduct,
        })
    } catch (error: unknown) {
        logger.error(`Error creating product - ${error}`)

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
