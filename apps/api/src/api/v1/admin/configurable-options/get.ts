import { type Request, type Response } from 'express'
import {
    getDb,
    configurableOptions,
    configurableOptionScopes,
    configurableOptionPricing,
} from '@fluxo/db'
import { eq, desc, sql, and, or, ilike, inArray, isNull } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { configurableOptionsCache } from '../../../../utils/cache'

export const getAllConfigurableOptions = async (
    req: Request,
    res: Response
) => {
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const search = req.query.search as string
        const pluginId = req.query.pluginId as string
        const productIdParam = req.query.productId as string
        const productId = productIdParam
            ? parseInt(productIdParam, 10)
            : undefined

        const cacheKey = `list:${page}:${limit}:${search || 'all'}:${pluginId || 'all'}:${productId ?? 'all'}`
        const cached = await configurableOptionsCache.get(cacheKey)
        if (cached) {
            return res.status(200).json(cached)
        }

        const db = getDb()
        const conditions = []
        if (search) {
            conditions.push(
                or(
                    ilike(configurableOptions.fieldKey, `%${search}%`),
                    sql`COALESCE(${configurableOptions.label}, '') ILIKE ${'%' + search + '%'}`
                )!
            )
        }
        if (pluginId) {
            conditions.push(eq(configurableOptions.pluginId, pluginId))
        }
        if (productId != null && !Number.isNaN(productId)) {
            const scopesForProduct = await db
                .select({
                    optionId: configurableOptionScopes.optionId,
                })
                .from(configurableOptionScopes)
                .where(
                    or(
                        eq(configurableOptionScopes.productId, productId),
                        isNull(configurableOptionScopes.productId)
                    )!
                )
            const optionIdsForProduct = [
                ...new Set(scopesForProduct.map((s) => s.optionId)),
            ]
            if (optionIdsForProduct.length === 0) {
                const response = {
                    success: true,
                    message: 'Configurable options fetched successfully',
                    configurableOptions: [],
                    total: 0,
                    page,
                    totalPages: 0,
                }
                return res.status(200).json(response)
            }
            conditions.push(
                inArray(configurableOptions.id, optionIdsForProduct)
            )
        }
        const whereClause =
            conditions.length > 0 ? and(...conditions) : undefined

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(configurableOptions)
            .where(whereClause)
        const total = Number(totalResult[0]?.count || 0)

        const list = await db
            .select()
            .from(configurableOptions)
            .where(whereClause)
            .orderBy(desc(configurableOptions.createdAt))
            .limit(limit)
            .offset((page - 1) * limit)

        const optionIds = list.map((o) => o.id)
        const scopes =
            optionIds.length > 0
                ? await db
                      .select()
                      .from(configurableOptionScopes)
                      .where(
                          inArray(configurableOptionScopes.optionId, optionIds)
                      )
                : []
        const pricingList =
            optionIds.length > 0
                ? await db
                      .select()
                      .from(configurableOptionPricing)
                      .where(
                          inArray(configurableOptionPricing.optionId, optionIds)
                      )
                : []

        const scopesByOption = new Map<number, typeof scopes>()
        for (const s of scopes) {
            if (!scopesByOption.has(s.optionId))
                scopesByOption.set(s.optionId, [])
            scopesByOption.get(s.optionId)!.push(s)
        }
        const pricingByOption = new Map(pricingList.map((p) => [p.optionId, p]))

        const configurableOptionsList = list.map((o) => ({
            ...o,
            scopes: scopesByOption.get(o.id) ?? [],
            pricing: pricingByOption.get(o.id) ?? null,
        }))

        const response = {
            success: true,
            message: 'Configurable options fetched successfully',
            configurableOptions: configurableOptionsList,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        await configurableOptionsCache.set(cacheKey, response, 180)
        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting configurable options - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export const getConfigurableOptionById = async (
    req: Request,
    res: Response
) => {
    try {
        const id = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid option ID',
            })
        }

        const cacheKey = `id:${id}`
        const cached = await configurableOptionsCache.get(cacheKey)
        if (cached) {
            return res.status(200).json(cached)
        }

        const db = getDb()
        const [option] = await db
            .select()
            .from(configurableOptions)
            .where(eq(configurableOptions.id, id))
            .limit(1)

        if (!option) {
            return res.status(404).json({
                success: false,
                message: 'Configurable option not found',
            })
        }

        const scopes = await db
            .select()
            .from(configurableOptionScopes)
            .where(eq(configurableOptionScopes.optionId, id))
        const [pricing] = await db
            .select()
            .from(configurableOptionPricing)
            .where(eq(configurableOptionPricing.optionId, id))
            .limit(1)

        const response = {
            success: true,
            message: 'Configurable option fetched successfully',
            configurableOption: {
                ...option,
                scopes,
                pricing: pricing ?? null,
            },
        }

        await configurableOptionsCache.set(cacheKey, response, 300)
        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting configurable option - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
