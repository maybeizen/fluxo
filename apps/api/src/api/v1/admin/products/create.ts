import { type Request, type Response } from 'express'
import { createProductSchema } from '../../../../validators/admin/products/create'
import { ZodError } from 'zod'
import { getDb, products, productIntegrations } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { productCache } from '../../../../utils/cache'

function formatIntegrations(integration: {
    servicePluginId: string | null
    servicePluginConfig: Record<string, unknown> | null
}) {
    return {
        servicePluginId: integration.servicePluginId ?? undefined,
        servicePluginConfig: integration.servicePluginConfig ?? undefined,
    }
}

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

        const hasServicePlugin =
            validated.integrations?.servicePluginId &&
            validated.integrations.servicePluginId.length > 0

        if (hasServicePlugin) {
            await db.insert(productIntegrations).values({
                productId: newProduct.id,
                servicePluginId: validated.integrations!.servicePluginId,
                servicePluginConfig:
                    validated.integrations!.servicePluginConfig ?? null,
            })
        }

        await productCache.delPattern('list:*')

        const [integration] = hasServicePlugin
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
                ? formatIntegrations(integration)
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
