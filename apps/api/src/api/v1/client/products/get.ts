import { Request, Response } from 'express'
import { getDb, products, eq, and, ilike, desc, sql } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { productCache } from '../../../../utils/cache'

export const getProducts = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 1000
        const search = req.query.search as string

        const cacheKey = `client:products:${page}:${limit}:${search || 'all'}`
        const cacheGetStart = Date.now()
        const cached = await productCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getProducts - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getProducts - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const conditions = [eq(products.hidden, false)]

        if (search) {
            conditions.push(ilike(products.name, `%${search}%`))
        }

        const whereClause = and(...conditions)

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(products)
            .where(whereClause)
        const total = Number(totalResult[0]?.count || 0)

        const productsList = await db
            .select()
            .from(products)
            .where(whereClause)
            .limit(limit)
            .offset((page - 1) * limit)
            .orderBy(desc(products.createdAt))

        const transformedProducts = productsList.map(
            (p: (typeof productsList)[0]) => ({
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
                timestamps: {
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                },
            })
        )

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
            `[Cache SET] getProducts - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
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
