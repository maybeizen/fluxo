import { Request, Response } from 'express'
import { getDb, coupons } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { couponCache } from '../../../../utils/cache'

export const deleteCoupon = async (req: Request, res: Response) => {
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

        await db.delete(coupons).where(eq(coupons.id, couponId))

        await couponCache.delPattern('list:*')
        await couponCache.del(`id:${couponId}`)
        await couponCache.del(`code:${coupon.code}`)

        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting coupon - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
