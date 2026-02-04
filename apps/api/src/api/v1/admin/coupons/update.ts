import { Request, Response } from 'express'
import { updateCouponSchema } from '../../../../validators/admin/coupons/update'
import { ZodError } from 'zod'
import { getDb, coupons } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { couponCache } from '../../../../utils/cache'

export const updateCoupon = async (req: Request, res: Response) => {
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

        const oldCode = coupon.code
        const validated = await updateCouponSchema.parseAsync(req.body)

        const updateData: any = { updatedAt: new Date() }
        if (validated.userId !== undefined) updateData.userId = validated.userId
        if (validated.code) updateData.code = validated.code
        if (validated.type) updateData.type = validated.type
        if (validated.value) updateData.value = validated.value
        if (validated.duration) {
            updateData.durationType = validated.duration.type
            updateData.durationCount = validated.duration.count || null
        }
        if (validated.maxRedemptions !== undefined) {
            updateData.maxRedemptions = validated.maxRedemptions
        }
        if (validated.expiresAt !== undefined) {
            updateData.expiresAt = validated.expiresAt
        }

        await db.update(coupons).set(updateData).where(eq(coupons.id, couponId))

        const [updatedCoupon] = await db
            .select()
            .from(coupons)
            .where(eq(coupons.id, couponId))
            .limit(1)

        await couponCache.delPattern('list:*')
        await couponCache.del(`id:${couponId}`)
        await couponCache.del(`code:${oldCode}`)
        if (validated.code && validated.code !== oldCode) {
            await couponCache.del(`code:${validated.code}`)
        }

        const transformedCoupon = {
            ...updatedCoupon,
            uuid: updatedCoupon.id.toString(),
            userUuid: updatedCoupon.userId
                ? updatedCoupon.userId.toString()
                : null,
            duration: {
                type: updatedCoupon.durationType,
                count: updatedCoupon.durationCount,
            },
            timestamps: {
                createdAt: updatedCoupon.createdAt,
                updatedAt: updatedCoupon.updatedAt,
                deletedAt: updatedCoupon.deletedAt,
            },
        }

        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            coupon: transformedCoupon,
        })
    } catch (error: unknown) {
        logger.error(`Error updating coupon - ${error}`)

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
