import { performance } from 'node:perf_hooks'
import nodemailer, { type Transporter } from 'nodemailer'
import { env } from './env'
import { logger } from './logger'
import path from 'path'
import { fileURLToPath } from 'url'
import { getDb, settings } from '@fluxo/db'
import { decrypt } from './encryption'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let transporter: Transporter | null = null

const createTransporter = async (): Promise<Transporter> => {
    const db = getDb()
    const [settingsRow] = await db.select().from(settings).limit(1)

    if (!settingsRow) {
        throw new Error('Settings not found')
    }

    const smtpHost = settingsRow.emailSmtpHost
    const smtpPort = settingsRow.emailSmtpPort
    const smtpUser = settingsRow.emailSmtpUser
    const smtpPass = settingsRow.emailSmtpPass

    const port = Number(smtpPort) || Number(env.SMTP_PORT)

    return nodemailer.createTransport({
        host: smtpHost || env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
            user: smtpUser || env.SMTP_USER,
            pass: smtpPass ? decrypt(smtpPass) : env.SMTP_PASS,
        },
    })
}

export const getTransporter = async (): Promise<Transporter> => {
    if (!transporter) {
        transporter = await createTransporter()
    }
    return transporter
}

interface SendEmailOptions {
    to: string
    subject: string
    html: string
    text?: string
}

export const sendEmail = async ({
    to,
    subject,
    html,
    text,
}: SendEmailOptions): Promise<boolean> => {
    try {
        const startTime = performance.now()

        const transporter = await getTransporter()

        const db = getDb()
        const [settingsRow] = await db.select().from(settings).limit(1)
        const fromEmail =
            settingsRow?.emailFrom || env.EMAIL_FROM || env.SMTP_USER

        if (!fromEmail) {
            throw new Error('From email address is not configured')
        }

        const logoPath = path.join(__dirname, '../assets/logo.png')

        await transporter.sendMail({
            from: `"${env.APP_NAME}" <${fromEmail}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
            attachments: [
                {
                    filename: 'logo.png',
                    path: logoPath,
                    cid: 'logo',
                },
            ],
        })

        const endTime = performance.now()
        const duration = endTime - startTime

        logger.success(
            `Email sent successfully to ${to} in ${Math.round(duration)}ms`
        )
        return true
    } catch (error: unknown) {
        logger.error(`Failed to send email - ${error}`)
        return false
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const sendBulkEmails = async (
    emails: SendEmailOptions[]
): Promise<boolean> => {
    try {
        const BATCH_SIZE = 50
        const BATCH_DELAY = 10000

        const startTime = performance.now()
        let sentCount = 0
        let failedCount = 0
        const totalBatches = Math.ceil(emails.length / BATCH_SIZE)

        for (let i = 0; i < emails.length; i += BATCH_SIZE) {
            const batch = emails.slice(i, i + BATCH_SIZE)
            const batchNumber = Math.floor(i / BATCH_SIZE) + 1

            const results = await Promise.all(
                batch.map((email) => sendEmail(email))
            )

            sentCount += results.filter((success) => success).length
            failedCount += results.filter((success) => !success).length

            if (batchNumber < totalBatches) {
                logger.info(
                    `Batch ${batchNumber}/${totalBatches} complete, waiting some time before sending next batch`
                )
                await sleep(BATCH_DELAY)
            }
        }

        const endTime = performance.now()
        const duration = endTime - startTime

        logger.success(
            `Sent ${sentCount} bulk email(s) in ${Math.round(duration)}ms`
        )
        if (failedCount > 0) {
            logger.warn(`Failed to send ${failedCount} bulk email(s)`)
        }

        return sentCount > 0
    } catch (error: unknown) {
        logger.error(`Failed to send bulk emails - ${error}`)
        return false
    }
}
