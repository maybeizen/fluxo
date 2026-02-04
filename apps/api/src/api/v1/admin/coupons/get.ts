import { Request, Response } from 'express'
import { getDb, coupons } from '@fluxo/db'
import { eq, ilike, desc, sql, isNull, and } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { couponCache } from '../../../../utils/cache'

export const getAllCoupons = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const search = req.query.search as string

        const cacheKey = `list:${page}:${limit}:${search || 'all'}`
        const cacheGetStart = Date.now()
        const cached = await couponCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart

        if (cached) {
            logger.info(
                `[Cache HIT] getAllCoupons - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getAllCoupons - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const conditions = [isNull(coupons.deletedAt)]

        if (search) {
            conditions.push(ilike(coupons.code, `%${search}%`))
        }

        const whereClause = and(...conditions)

        const totalResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(coupons)
            .where(whereClause)
        const total = Number(totalResult[0]?.count || 0)

        const couponsList = await db
            .select()
            .from(coupons)
            .where(whereClause)
            .orderBy(desc(coupons.createdAt))
            .limit(limit)
            .offset((page - 1) * limit)

        const transformedCoupons = couponsList.map((c) => ({
            ...c,
            uuid: c.id.toString(),
            userUuid: c.userId ? c.userId.toString() : null,
            duration: {
                type: c.durationType,
                count: c.durationCount,
            },
            timestamps: {
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                deletedAt: c.deletedAt,
            },
        }))

        const response = {
            success: true,
            message: 'Coupons fetched successfully',
            coupons: transformedCoupons,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }

        const cacheSetStart = Date.now()
        await couponCache.set(cacheKey, response, 180)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getAllCoupons - Key: ${cacheKey}, TTL: 180s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting coupons - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export const getCouponById = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const couponId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(couponId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coupon ID',
            })
        }
        const cacheKey = `id:${couponId}`

        const cacheGetStart = Date.now()
        const cached = await couponCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getCouponById - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getCouponById - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [coupon] = await db
            .select()
            .from(coupons)
            .where(eq(coupons.id, couponId))
            .limit(1)

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            })
        }

        const transformedCoupon = {
            ...coupon,
            uuid: coupon.id.toString(),
            userUuid: coupon.userId ? coupon.userId.toString() : null,
            duration: {
                type: coupon.durationType,
                count: coupon.durationCount,
            },
            timestamps: {
                createdAt: coupon.createdAt,
                updatedAt: coupon.updatedAt,
                deletedAt: coupon.deletedAt,
            },
        }

        const response = {
            success: true,
            message: 'Coupon fetched successfully',
            coupon: transformedCoupon,
        }

        const cacheSetStart = Date.now()
        await couponCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getCouponById - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting coupon - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}

export const getCouponByCode = async (req: Request, res: Response) => {
    const startTime = Date.now()
    try {
        const codeParam = Array.isArray(req.params.code)
            ? req.params.code[0]
            : req.params.code
        const code = codeParam.toUpperCase()
        const cacheKey = `code:${code}`

        const cacheGetStart = Date.now()
        const cached = await couponCache.get(cacheKey)
        const cacheGetTime = Date.now() - cacheGetStart
        if (cached) {
            logger.info(
                `[Cache HIT] getCouponByCode - Key: ${cacheKey}, Time: ${cacheGetTime}ms, Total: ${Date.now() - startTime}ms`
            )
            return res.status(200).json(cached)
        }

        logger.info(
            `[Cache MISS] getCouponByCode - Key: ${cacheKey}, Time: ${cacheGetTime}ms`
        )

        const db = getDb()
        const [coupon] = await db
            .select()
            .from(coupons)
            .where(eq(coupons.code, code))
            .limit(1)

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found',
            })
        }

        const transformedCoupon = {
            ...coupon,
            uuid: coupon.id.toString(),
            userUuid: coupon.userId ? coupon.userId.toString() : null,
            duration: {
                type: coupon.durationType,
                count: coupon.durationCount,
            },
            timestamps: {
                createdAt: coupon.createdAt,
                updatedAt: coupon.updatedAt,
                deletedAt: coupon.deletedAt,
            },
        }

        const response = {
            success: true,
            message: 'Coupon fetched successfully',
            coupon: transformedCoupon,
        }

        const cacheSetStart = Date.now()
        await couponCache.set(cacheKey, response, 300)
        const cacheSetTime = Date.now() - cacheSetStart
        logger.info(
            `[Cache SET] getCouponByCode - Key: ${cacheKey}, TTL: 300s, Time: ${cacheSetTime}ms, Total: ${Date.now() - startTime}ms`
        )

        res.status(200).json(response)
    } catch (error: unknown) {
        logger.error(`Error getting coupon by code - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
