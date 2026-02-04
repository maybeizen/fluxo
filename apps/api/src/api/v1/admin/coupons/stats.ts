import { Request, Response } from 'express'
import { getDb, coupons, couponRedemptions } from '@fluxo/db'
import { eq, sql } from '@fluxo/db'
import { logger } from '../../../../utils/logger'

export const getCouponStats = async (req: Request, res: Response) => {
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

        const redemptionCountResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(couponRedemptions)
            .where(eq(couponRedemptions.couponId, coupon.id))
        const redemptionCount = Number(redemptionCountResult[0]?.count || 0)

        const isExpired = coupon.expiresAt
            ? new Date() > coupon.expiresAt
            : false
        const isMaxedOut = coupon.maxRedemptions
            ? redemptionCount >= coupon.maxRedemptions
            : false

        res.status(200).json({
            success: true,
            message: 'Coupon stats fetched successfully',
            stats: {
                redemptionCount,
                maxRedemptions: coupon.maxRedemptions || null,
                isExpired,
                isMaxedOut,
                isActive: !isExpired && !isMaxedOut,
            },
        })
    } catch (error: unknown) {
        logger.error(`Error getting coupon stats - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
