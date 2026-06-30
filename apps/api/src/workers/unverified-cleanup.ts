import cron from 'node-cron'
import { getDb, users } from '@fluxo/db'
import { eq, and, lt } from '@fluxo/db'
import { logger } from '../utils/logger'

export const startUnverifiedCleanupWorker = () => {
    cron.schedule('0 2 * * *', async () => {
        try {
            const db = getDb()
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - 7)

            await db
                .delete(users)
                .where(
                    and(
                        eq(users.isVerified, false),
                        lt(users.createdAt, cutoffDate)
                    )
                )

            logger.info('Cleaned up unverified account(s)')
        } catch (error) {
            logger.error(`Unverified Cleanup Worker failed - ${error}`)
        }
    })

    logger.success('Unverified Cleanup Worker started', { badge: 'CRON' })
}
