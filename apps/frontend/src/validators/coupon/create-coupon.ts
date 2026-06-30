import { z } from 'zod'
import { CouponType, CouponDurationType } from '@fluxo/types'

export const createCouponSchema = z
    .object({
        code: z
            .string()
            .min(3, 'Coupon code must be at least 3 characters')
            .max(50, 'Coupon code must be less than 50 characters')
            .regex(
                /^[A-Z0-9_-]+$/,
                'Coupon code must only contain uppercase letters, numbers, hyphens, and underscores'
            )
            .transform((val) => val.toUpperCase()),
        type: z.enum(CouponType),
        value: z.number().positive('Value must be greater than 0'),
        durationType: z.enum(CouponDurationType),
        durationCount: z
            .number()
            .int('Duration count must be a whole number')
            .positive('Duration count must be greater than 0')
            .optional()
            .nullable(),
        maxRedemptions: z
            .number()
            .int('Max redemptions must be a whole number')
            .positive('Max redemptions must be greater than 0')
            .optional()
            .nullable(),
        expiresAt: z
            .string()
            .optional()
            .nullable()
            .refine((val) => {
                if (!val || val === '') return true
                const date = new Date(val)
                return !isNaN(date.getTime()) && date > new Date()
            }, 'Expiration date must be in the future'),
        userUuid: z
            .union([
                z.uuid('Invalid user ID'),
                z.literal(''),
                z.null(),
                z.undefined(),
            ])
            .transform((val) => (val === '' || !val ? null : val)),
    })
    .refine(
        (data) => {
            if (data.type === CouponType.PERCENTAGE && data.value > 100) {
                return false
            }
            return true
        },
        {
            message: 'Percentage value cannot exceed 100',
            path: ['value'],
        }
    )
    .refine(
        (data) => {
            if (
                data.durationType === CouponDurationType.REPEATING &&
                !data.durationCount
            ) {
                return false
            }
            return true
        },
        {
            message: 'Duration count is required for repeating coupons',
            path: ['durationCount'],
        }
    )

export type CreateCouponFormData = z.infer<typeof createCouponSchema>
