import cron from 'node-cron'
import { getDb, invoices } from '@fluxo/db'
import { eq, and, lt } from '@fluxo/db'
import { InvoiceStatus } from '@fluxo/types'
import { logger } from '../utils/logger'
import { invoiceCache } from '../utils/cache'

export const startInvoiceExpiryWorker = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const db = getDb()
            const now = new Date()

            const invoicesToExpire = await db
                .select()
                .from(invoices)
                .where(
                    and(
                        eq(invoices.status, InvoiceStatus.PENDING),
                        lt(invoices.expiresAt, now)
                    )
                )

            if (invoicesToExpire.length === 0) return

            for (const invoice of invoicesToExpire) {
                await db
                    .update(invoices)
                    .set({
                        status: InvoiceStatus.EXPIRED,
                        expiredAt: now,
                    })
                    .where(eq(invoices.id, invoice.id))

                await invoiceCache.del(`id:${invoice.id}`)
                if (invoice.transactionId) {
                    await invoiceCache.del(
                        `transaction:${invoice.transactionId}`
                    )
                }
                await invoiceCache.delPattern(`userId:${invoice.userId}:*`)
                await invoiceCache.delPattern('list:*')
            }

            logger.info(`Expired ${invoicesToExpire.length} invoice(s)`)
        } catch (error) {
            logger.error(`Invoice Expiry Worker failed - ${error}`)
        }
    })

    logger.success('Invoice Expiry Worker started', { badge: 'CRON' })
}
