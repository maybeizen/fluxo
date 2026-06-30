import cron from 'node-cron'
import { getDb, services, users } from '@fluxo/db'
import { eq, and, lt, inArray } from '@fluxo/db'
import { ServiceStatus } from '@fluxo/types'
import { logger } from '../utils/logger'
import { sendBulkEmails } from '../utils/mailer'
import { env } from '../utils/env'
import { serviceSuspendedTemplate } from '../utils/email-templates'

const SUSPENSION_DAYS_AFTER_DUE = 4

export const startServiceSuspensionWorker = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            const db = getDb()
            const now = new Date()

            const suspensionDate = new Date(now)
            suspensionDate.setDate(
                suspensionDate.getDate() - SUSPENSION_DAYS_AFTER_DUE
            )
            suspensionDate.setHours(0, 0, 0, 0)

            const servicesToSuspend = await db
                .select()
                .from(services)
                .where(
                    and(
                        eq(services.status, ServiceStatus.ACTIVE),
                        lt(services.dueDate, suspensionDate)
                    )
                )

            if (servicesToSuspend.length === 0) return

            const ownerIds = [
                ...new Set(servicesToSuspend.map((s) => s.serviceOwnerId)),
            ]
            const usersList = await db
                .select({
                    id: users.id,
                    email: users.email,
                    firstName: users.firstName,
                })
                .from(users)
                .where(inArray(users.id, ownerIds))
            const userMap = new Map(usersList.map((u) => [u.id, u]))

            const emails = []

            for (const service of servicesToSuspend) {
                const user = userMap.get(service.serviceOwnerId)
                if (!user) continue

                const serviceUrl = `${env.FRONTEND_URL}/client/services/${service.id}`

                emails.push({
                    to: user.email,
                    subject: `Service Suspended - ${service.serviceName}`,
                    html: serviceSuspendedTemplate(
                        user.firstName,
                        service.serviceName,
                        (service.monthlyPrice / 100).toFixed(2),
                        serviceUrl
                    ),
                })

                await db
                    .update(services)
                    .set({
                        status: ServiceStatus.SUSPENDED,
                        isSuspended: true,
                        suspensionReason: 'Payment overdue - Service Suspended',
                        suspensionDate: now,
                    })
                    .where(eq(services.id, service.id))
            }

            logger.warn(
                `Suspended ${servicesToSuspend.length} service(s) due to overdue payment`
            )

            if (emails.length > 0) {
                await sendBulkEmails(emails)
            }
        } catch (error) {
            logger.error(`Service Suspension Worker failed - ${error}`)
        }
    })

    logger.success('Service Suspension Worker started', { badge: 'CRON' })
}
