import cron from 'node-cron'
import { getDb, coupons } from '@fluxo/db'
import { lt, and, isNotNull } from '@fluxo/db'
import { logger } from '../utils/logger'

export const startCouponExpiryWorker = () => {
    cron.schedule('*/5 * * * *', async () => {
        try {
            const db = getDb()
            const now = new Date()

            const result = await db
                .delete(coupons)
                .where(
                    and(
                        isNotNull(coupons.expiresAt),
                        lt(coupons.expiresAt, now)
                    )
                )

            logger.info(`Deleted expired coupon(s)`)
        } catch (error) {
            logger.error(`Coupon Expiry Worker failed - ${error}`)
        }
    })

    logger.success('Coupon Expiry Worker started', { badge: 'CRON' })
}
