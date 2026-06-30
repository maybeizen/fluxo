import { z } from 'zod'
import { getDb, coupons, couponRedemptions } from '@fluxo/db'
import { eq, and, isNull, sql } from '@fluxo/db'

export const createValidateCouponSchema = (userId: number) =>
    z
        .object({
            code: z
                .string()
                .min(1, 'Coupon code is required')
                .max(50, 'Coupon code must be less than 50 characters')
                .transform((val) => val.toUpperCase().trim()),
        })
        .superRefine(async (data, ctx) => {
            const db = getDb()
            const [coupon] = await db
                .select()
                .from(coupons)
                .where(
                    and(eq(coupons.code, data.code), isNull(coupons.deletedAt))
                )
                .limit(1)

            if (!coupon) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['code'],
                    message: 'Invalid coupon code',
                })
                return
            }

            if (coupon.expiresAt && new Date() > coupon.expiresAt) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['code'],
                    message: 'Coupon has expired',
                })
                return
            }

            if (coupon.userId && coupon.userId !== userId) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['code'],
                    message: 'This coupon is not valid for your account',
                })
                return
            }

            if (coupon.maxRedemptions) {
                const redemptionCountResult = await db
                    .select({ count: sql<number>`count(*)` })
                    .from(couponRedemptions)
                    .where(eq(couponRedemptions.couponId, coupon.id))

                const redemptionCount = Number(
                    redemptionCountResult[0]?.count || 0
                )

                if (redemptionCount >= coupon.maxRedemptions) {
                    ctx.addIssue({
                        code: 'custom',
                        path: ['code'],
                        message:
                            'Coupon has reached its maximum redemption limit',
                    })
                    return
                }
            }

            ;(data as any)._coupon = coupon
        })
        .transform((data) => {
            return {
                code: data.code,
                coupon: (data as any)._coupon,
            }
        })

export type ValidateCouponSchema = z.infer<
    ReturnType<typeof createValidateCouponSchema>
>
