import { Request, Response } from 'express'
import { createCouponSchema } from '../../../../validators/admin/coupons/create'
import { ZodError } from 'zod'
import { getDb, coupons } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { couponCache } from '../../../../utils/cache'

export const createCoupon = async (req: Request, res: Response) => {
    try {
        const validated = await createCouponSchema.parseAsync(req.body)

        const db = getDb()
        const couponValues = {
            userId: validated.userId ?? null,
            code: validated.code,
            type: validated.type as 'percentage' | 'fixed',
            value: validated.value,
            durationType: validated.duration.type as
                | 'once'
                | 'forever'
                | 'repeating',
            durationCount: validated.duration.count ?? null,
            maxRedemptions: validated.maxRedemptions ?? null,
            expiresAt: validated.expiresAt ?? null,
        }
        const [newCoupon] = await db
            .insert(coupons)
            .values(couponValues)
            .returning()

        await couponCache.delPattern('list:*')

        const transformedCoupon = {
            ...newCoupon,
            uuid: newCoupon.id.toString(),
            userUuid: newCoupon.userId ? newCoupon.userId.toString() : null,
            duration: {
                type: newCoupon.durationType,
                count: newCoupon.durationCount,
            },
            timestamps: {
                createdAt: newCoupon.createdAt,
                updatedAt: newCoupon.updatedAt,
                deletedAt: newCoupon.deletedAt,
            },
        }

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            coupon: transformedCoupon,
        })
    } catch (error: unknown) {
        logger.error(`Error creating coupon - ${error}`)

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
