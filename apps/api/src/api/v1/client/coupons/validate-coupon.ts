import { Request, Response } from 'express'
import { logger } from '../../../../utils/logger'
import { createValidateCouponSchema } from '../../../../validators/client/coupons/validate-coupon'
import { ZodError } from 'zod'

export const validateCoupon = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const validateCouponSchema = createValidateCouponSchema(req.userId)
        const { coupon } = await validateCouponSchema.parseAsync(req.body)

        res.status(200).json({
            success: true,
            message: 'Coupon is valid',
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                duration: coupon.duration,
            },
        })
    } catch (error: unknown) {
        logger.error(`Error validating coupon - ${error}`)

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
