import cron from 'node-cron'
import { getDb, invoices, users } from '@fluxo/db'
import { eq, and, gte, lt } from '@fluxo/db'
import { InvoiceStatus } from '@fluxo/types'
import { logger } from '../utils/logger'
import { sendBulkEmails } from '../utils/mailer'
import { invoiceReminderTemplate } from '../utils/email-templates'
import { env } from '../utils/env'

const REMINDER_DAYS = [7, 3, 1]

export const startInvoiceReminderWorker = () => {
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

                const invoicesList = await db
                    .select()
                    .from(invoices)
                    .where(
                        and(
                            eq(invoices.status, InvoiceStatus.PENDING),
                            gte(invoices.expiresAt, targetDate),
                            lt(invoices.expiresAt, nextDay)
                        )
                    )

                for (const invoice of invoicesList) {
                    const [user] = await db
                        .select()
                        .from(users)
                        .where(eq(users.id, invoice.userId))
                        .limit(1)
                    if (!user) continue

                    const dueDate = new Date(
                        invoice.expiresAt
                    ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })

                    const invoiceUrl = `${env.FRONTEND_URL}/client/invoices/${invoice.id}`
                    const amount = (invoice.amount / 100).toFixed(2)

                    emails.push({
                        to: user.email,
                        subject: `Invoice Reminder - Payment Due in ${days} Day${days > 1 ? 's' : ''}`,
                        html: invoiceReminderTemplate(
                            user.firstName || user.username,
                            invoice.id.toString(),
                            days,
                            dueDate,
                            amount,
                            invoiceUrl
                        ),
                    })
                }
            }

            if (emails.length > 0) {
                await sendBulkEmails(emails)
                logger.info(`Sent ${emails.length} invoice reminder(s)`)
            }
        } catch (error) {
            logger.error(`Invoice Reminder Worker failed - ${error}`)
        }
    })

    logger.success('Invoice Reminder Worker started', { badge: 'CRON' })
}
