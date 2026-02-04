import { Request, Response } from 'express'
import { getDb, invoices } from '@fluxo/db'
import { eq, and } from '@fluxo/db'
import { InvoiceStatus } from '@fluxo/types'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'

export const removeCouponFromInvoice = async (req: Request, res: Response) => {
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
                message: 'Coupon can only be removed from pending invoices',
            })
        }

        await db
            .update(invoices)
            .set({
                couponCode: null,
                couponType: null,
                couponValue: null,
                updatedAt: new Date(),
            })
            .where(eq(invoices.id, invoiceId))

        await invoiceCache.delPattern('list:*')
        await invoiceCache.delPattern(`userId:${userId}:*`)
        await invoiceCache.del(`id:${invoiceId}`)

        res.status(200).json({
            success: true,
            message: 'Coupon removed successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error removing coupon from invoice - ${error}`)

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
