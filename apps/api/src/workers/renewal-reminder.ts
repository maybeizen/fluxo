import cron from 'node-cron'
import { getDb, services, users } from '@fluxo/db'
import { eq, and, gte, lt } from '@fluxo/db'
import { ServiceStatus } from '@fluxo/types'
import { logger } from '../utils/logger'
import { sendBulkEmails } from '../utils/mailer'
import { env } from '../utils/env'
import { renewalReminderTemplate } from '../utils/email-templates'

const REMINDER_DAYS = [7, 3, 1]

export const startRenewalReminderWorker = () => {
    cron.schedule('0 */3 * * *', async () => {
        try {
            const db = getDb()
            const now = new Date()
            const emails = []

            for (const days of REMINDER_DAYS) {
                const targetDate = new Date(now)
                targetDate.setDate(targetDate.getDate() + days)
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

                    emails.push({
                        to: user.email,
                        subject: `Service Renewal Reminder - ${service.serviceName}`,
                        html: renewalReminderTemplate(
                            user.firstName,
                            service.serviceName,
                            days,
                            dueDate,
                            (service.monthlyPrice / 100).toFixed(2),
                            serviceUrl
                        ),
                    })
                }
            }

            if (emails.length > 0) {
                await sendBulkEmails(emails)
            }
        } catch (error) {
            logger.error(`Renewal Reminder Worker failed - ${error}`)
        }
    })

    logger.success('Renewal Reminder Worker started', { badge: 'CRON' })
}
