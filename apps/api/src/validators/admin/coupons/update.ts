import { z } from 'zod'
import { CouponType, CouponDurationType } from '@fluxo/types'

export const updateCouponSchema = z
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
            .transform((val) => val.toUpperCase())
            .optional(),
        type: z
            .enum(Object.values(CouponType) as [string, ...string[]])
            .optional(),
        value: z.number().positive('Value must be positive').optional(),
        duration: z
            .object({
                type: z.enum(
                    Object.values(CouponDurationType) as [string, ...string[]]
                ),
                count: z.number().int().positive().optional(),
            })
            .optional(),
        maxRedemptions: z.number().int().positive().nullable().optional(),
        expiresAt: z.coerce.date().nullable().optional(),
    })
    .superRefine(async (data, ctx) => {
        if (
            data.type === CouponType.PERCENTAGE &&
            data.value &&
            data.value > 100
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['value'],
                message: 'Percentage value cannot exceed 100',
            })
        }

        if (
            data.duration &&
            data.duration.type === CouponDurationType.REPEATING &&
            !data.duration.count
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['duration', 'count'],
                message: 'Count is required for repeating coupons',
            })
        }
    })

export type UpdateCouponSchema = z.infer<typeof updateCouponSchema>
