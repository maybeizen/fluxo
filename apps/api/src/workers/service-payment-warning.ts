import cron from 'node-cron'
import { getDb, services, users } from '@fluxo/db'
import { eq, and, gte, lt } from '@fluxo/db'
import { ServiceStatus } from '@fluxo/types'
import { logger } from '../utils/logger'
import { sendBulkEmails } from '../utils/mailer'
import { env } from '../utils/env'
import { servicePaymentWarningTemplate } from '../utils/email-templates'

const WARNING_DAYS_AFTER_DUE = [1, 3]

export const startServicePaymentWarningWorker = () => {
    cron.schedule('0 */3 * * *', async () => {
        try {
            const db = getDb()
            const now = new Date()
            const emails = []

            for (const daysAfterDue of WARNING_DAYS_AFTER_DUE) {
                const targetDate = new Date(now)
                targetDate.setDate(targetDate.getDate() - daysAfterDue)
                targetDate.setHours(0, 0, 0, 0)

                const nextDay = new Date(targetDate)
                nextDay.setDate(nextDay.getDate() + 1)

                const servicesList = await db
                    .select()
                    .from(services)
                    .where(
                        and(
                            eq(services.status, ServiceStatus.ACTIVE),
                            gte(services.dueDate, targetDate),
                            lt(services.dueDate, nextDay)
                        )
                    )

                for (const service of servicesList) {
                    const [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, service.serviceOwnerId))
                        .limit(1)
                    if (!user) continue

                    const dueDate = new Date(
                        service.dueDate
                    ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })

                    const serviceUrl = `${env.FRONTEND_URL}/client/services/${service.id}`
                    const amount = (service.monthlyPrice / 100).toFixed(2)
                    const daysUntilSuspension = 4 - daysAfterDue

                    emails.push({
                        to: user.email,
                        subject: `Payment Overdue Warning - ${service.serviceName}`,
                        html: servicePaymentWarningTemplate(
                            user.firstName || user.username || 'User',
                            service.serviceName,
                            daysAfterDue,
                            daysUntilSuspension,
                            dueDate,
                            amount,
                            serviceUrl
                        ),
                    })
                }
            }

            if (emails.length > 0) {
                await sendBulkEmails(emails)
                logger.info(`Sent ${emails.length} service payment warning(s)`)
            }
        } catch (error) {
            logger.error(`Service Payment Warning Worker failed - ${error}`)
        }
    })

    logger.success('Service Payment Warning Worker started', { badge: 'CRON' })
}
