import { Request, Response } from 'express'
import { getDb, invoices } from '@fluxo/db'
import { eq } from '@fluxo/db'
import { logger } from '../../../../utils/logger'
import { invoiceCache } from '../../../../utils/cache'

export const deleteInvoice = async (req: Request, res: Response) => {
    try {
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
            .where(eq(invoices.id, invoiceId))
            .limit(1)

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found',
            })
        }

        await db.delete(invoices).where(eq(invoices.id, invoiceId))

        await invoiceCache.delPattern('list:*')
        await invoiceCache.del(`id:${invoiceId}`)
        if (invoice.transactionId) {
            await invoiceCache.del(`transaction:${invoice.transactionId}`)
        }
        await invoiceCache.delPattern(`userId:${invoice.userId}:*`)

        res.status(200).json({
            success: true,
            message: 'Invoice deleted successfully',
        })
    } catch (error: unknown) {
        logger.error(`Error deleting invoice - ${error}`)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
