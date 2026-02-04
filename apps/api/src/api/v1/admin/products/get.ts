import { Request, Response } from 'express'
import { getDb, products, productIntegrations } from '@fluxo/db'
import { eq, and, or, ilike, desc, asc, sql, inArray } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { productCache } from '../../../../utils/cache'

export const getAllProducts = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const search = req.query.search as string
        const includeHidden = req.query.includeHidden === 'true'

        const cacheKey = `list:${page}:${limit}:${search || 'all'}:${includeHidden}`
        const cacheGetStart = Date.now()
        const cached = await productCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getAllProducts - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getAllProducts - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const conditions = []

        if (!includeHidden) {
            conditions.push(eq(products.hidden, false))
        }

        if (search) {
            conditions.push(ilike(products.name, `%${search}%`))
        }

        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined

        const totalQuery = db
            .select({ count: sql<number>`count(*)` })
            .from(products)
        const totalResult = whereClause
            ? await totalQuery.where(whereClause)
            : await totalQuery
        const total = Number(totalResult[0]?.count || 0)

        const productsList = whereClause
            ? await db
                  .select()
                  .from(products)
                  .where(whereClause)
                  .limit(limit)
                  .offset((page - 1) * limit)
                  .orderBy(
                      asc(products.categoryId),
                      asc(products.order),
                      desc(products.createdAt)
                  )
            : await db
                  .select()
                  .from(products)
                  .limit(limit)
                  .offset((page - 1) * limit)
                  .orderBy(
                      asc(products.categoryId),
                      asc(products.order),
                      desc(products.createdAt)
                  )

        // Fetch all integrations for the products in one query
        const productIds = productsList.map((p) => p.id)
        const integrationsList =
            productIds.length > 0
                ? await db
                      .select()
                      .from(productIntegrations)
                      .where(inArray(productIntegrations.productId, productIds))
                : []

        // Create a map of productId -> integration for quick lookup
        const integrationsMap = new Map(
            integrationsList.map((i) => [i.productId, i])
        )

        const transformedProducts = productsList.map((p) => {
            const integration = integrationsMap.get(p.id)

            return {
                id: p.id,
                uuid: p.id.toString(),
                metadata: {
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    tags: p.tags || [],
                },
                specifications: {
                    cpu: p.cpu,
                    ram: p.ram,
                    storage: p.storage,
                    ports: p.ports,
                    databases: p.databases,
                    backups: p.backups,
                },
                status: {
                    hidden: p.hidden,
                    disabled: p.disabled,
                    allowCoupons: p.allowCoupons,
                },
                stock: {
                    stockEnabled: p.stockEnabled,
                    stock: p.stock,
                },
                category: p.categoryId,
                order: p.order,
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
                          servicePluginId:
                              integration.servicePluginId ?? undefined,
                          servicePluginConfig:
                              integration.servicePluginConfig ?? undefined,
                      }
                    : undefined,
                timestamps: {
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                },
            }
        })

        const response = {
            success: true,
            message: 'Products fetched successfully',
            products: transformedProducts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        const cacheSetStart = Date.now()
        await productCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getAllProducts - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting products - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export const getProductById = async (req: Request, res: Response) => {
    const startTime = Date.now()
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
        const cacheKey = `id:${productId}`

        const cacheGetStart = Date.now()
        const cached = await productCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getProductById - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getProductById - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

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

        const [integration] = await db
            .select()
            .from(productIntegrations)
            .where(eq(productIntegrations.productId, product.id))
            .limit(1)

        const transformedProduct = {
            id: product.id,
            uuid: product.id.toString(),
            metadata: {
                name: product.name,
                description: product.description,
                price: product.price,
                tags: product.tags || [],
            },
            specifications: {
                cpu: product.cpu,
                ram: product.ram,
                storage: product.storage,
                ports: product.ports,
                databases: product.databases,
                backups: product.backups,
            },
            status: {
                hidden: product.hidden,
                disabled: product.disabled,
                allowCoupons: product.allowCoupons,
            },
            stock: {
                stockEnabled: product.stockEnabled,
                stock: product.stock,
            },
            category: product.categoryId,
            order: product.order,
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
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
            },
        }

        const response = {
            success: true,
            message: 'Product fetched successfully',
            product: transformedProduct,
        }

        const cacheSetStart = Date.now()
        await productCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getProductById - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting product - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
