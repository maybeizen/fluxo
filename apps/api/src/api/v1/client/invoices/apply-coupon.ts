import { Request, Response } from 'express'
import { getDb, invoices } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { InvoiceStatus } from '@fluxo/types'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'
import { createValidateCouponSchema } from '../../../../validators/client/coupons/validate-coupon'
import { ZodError } from 'zod'

export const applyCouponToInvoice = async (req: Request, res: Response) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            })
        }

        const userId = req.userId

        const invoiceId = parseInt(
            Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
            10
        )
        if (isNaN(invoiceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid invoice ID',
            })
        }
        const db = getDb()
        const [invoice] = await db
            .select()
            .from(invoices)
            .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
            .limit(1)

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            })
        }

        if (invoice.status !== InvoiceStatus.PENDING) {
            return res.status(400).json({
                success: false,
                message: 'Coupon can only be applied to pending invoices',
            })
        }

        const validateCouponSchema = createValidateCouponSchema(userId)
        const { coupon } = await validateCouponSchema.parseAsync(req.body)

        await db
            .update(invoices)
            .set({
                couponCode: coupon.code,
                couponType: coupon.type,
                couponValue: coupon.value,
                updatedAt: new Date(),
            })
            .where(eq(invoices.id, invoiceId))

        await invoiceCache.delPattern('list:*')
        await invoiceCache.delPattern(`userId:${userId}:*`)
        await invoiceCache.del(`id:${invoiceId}`)

        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error applying coupon to invoice - ${error}`)

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
