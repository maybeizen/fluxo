import cron from 'node-cron'
import { getDb, services, invoices, invoiceItems, users } from '@fluxo/db'
import { eq, and, gte, lt } from '@fluxo/db'
import { ServiceStatus, InvoiceStatus, PaymentProvider } from '@fluxo/types'
import { logger } from '../utils/logger'
import { sendBulkEmails } from '../utils/mailer'
import { invoiceTemplate } from '../utils/email-templates'
import { env } from '../utils/env'
import { invoiceCache } from '../utils/cache'

const DAYS_BEFORE_DUE = 7

export const startInvoiceCreationWorker = () => {
    cron.schedule('0 */2 * * *', async () => {
        try {
            const db = getDb()
            const now = new Date()
            const targetDate = new Date(now)
            targetDate.setDate(targetDate.getDate() + DAYS_BEFORE_DUE)
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

            if (servicesList.length === 0) return

            const emails = []
            let invoicesCreated = 0

            for (const service of servicesList) {
                const [existingInvoice] = await db
                    .select()
                    .from(invoices)
                    .where(
                        and(
                            eq(invoices.serviceId, service.id),
                            eq(invoices.status, InvoiceStatus.PENDING),
                            gte(invoices.expiresAt, now)
                        )
                    )
                    .limit(1)

                if (existingInvoice) continue

                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.id, service.serviceOwnerId))
                    .limit(1)
                if (!user) continue

                const expiresAt = new Date(service.dueDate)
                expiresAt.setDate(expiresAt.getDate() + 7)
                expiresAt.setHours(23, 59, 59, 999)

                const [newInvoice] = await db
                    .insert(invoices)
                    .values({
                        userId: user.id,
                        serviceId: service.id,
                        status: InvoiceStatus.PENDING,
                        amount: Math.round(service.monthlyPrice),
                        currency: 'usd',
                        paymentProvider: PaymentProvider.STRIPE,
                        expiresAt,
                    })
                    .returning()

                await db.insert(invoiceItems).values({
                    invoiceId: newInvoice.id,
                    name: `${service.serviceName} - Monthly Subscription`,
                    quantity: 1,
                    unitPrice: Math.round(service.monthlyPrice),
                    total: Math.round(service.monthlyPrice),
                })

                invoicesCreated++

                await invoiceCache.delPattern(`userId:${user.id}:*`)
                await invoiceCache.delPattern('list:*')

                const invoiceDate = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })

                const dueDate = expiresAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })

                const invoiceUrl = `${env.FRONTEND_URL}/client/invoices/${newInvoice.id}`

                emails.push({
                    to: user.email,
                    subject: `New Invoice - ${service.serviceName}`,
                    html: invoiceTemplate(
                        user.firstName || user.username,
                        service.serviceName,
                        invoiceDate,
                        dueDate,
                        (service.monthlyPrice / 100).toFixed(2),
                        invoiceUrl
                    ),
                })
            }

            if (invoicesCreated > 0) {
                logger.info(
                    `Created ${invoicesCreated} invoice(s) for services due in ${DAYS_BEFORE_DUE} days`
                )
            }

            if (emails.length > 0) {
                await sendBulkEmails(emails)
            }
        } catch (error) {
            logger.error(`Invoice Creation Worker failed - ${error}`)
        }
    })

    logger.success('Invoice Creation Worker started', { badge: 'CRON' })
}
