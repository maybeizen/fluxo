import { z } from 'zod'
import { CouponType, CouponDurationType } from '@fluxo/types'
import { getDb, coupons } from '@fluxo/db'
import { eq } from '@fluxo/db'

export const createCouponSchema = z
    .object({
        userId: z.coerce.number().nullable().optional(),
        code: z
            .string()
            .min(3, 'Coupon code must be at least 3 characters')
            .max(50, 'Coupon code must be less than 50 characters')
            .regex(
                /^[A-Z0-9_-]+$/,
                'Coupon code must only contain uppercase letters, numbers, hyphens, and underscores'
            )
            .transform((val) => val.toUpperCase()),
        type: z.enum(Object.values(CouponType) as [string, ...string[]]),
        value: z.number().positive('Value must be positive'),
        duration: z.object({
            type: z.enum(
                Object.values(CouponDurationType) as [string, ...string[]]
            ),
            count: z.number().int().positive().optional(),
        }),
        maxRedemptions: z.number().int().positive().optional(),
        expiresAt: z.coerce.date().optional(),
    })
    .superRefine(async (data, ctx) => {
        if (data.type === CouponType.PERCENTAGE && data.value > 100) {
            ctx.addIssue({
                code: 'custom',
                path: ['value'],
                message: 'Percentage value cannot exceed 100',
            })
        }

        if (
            data.duration.type === CouponDurationType.REPEATING &&
            !data.duration.count
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['duration', 'count'],
                message: 'Count is required for repeating coupons',
            })
        }

        const db = getDb()
        const [existingCoupon] = await db
            .select()
            .from(coupons)
            .where(eq(coupons.code, data.code))
            .limit(1)
        if (existingCoupon) {
            ctx.addIssue({
                code: 'custom',
                path: ['code'],
                message: 'Coupon code already exists',
            })
        }
    })

export type CreateCouponSchema = z.infer<typeof createCouponSchema>
