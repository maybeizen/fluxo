import type { Request, Response } from 'express'
import { sendEmail } from '../../../../utils/mailer'
import { logger } from '../../../../utils/logger'
import { env } from '../../../../utils/env'
import { testEmailTemplate } from '../../../../utils/email-templates'

export const sendTestEmail = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { email } = req.body

        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Email address is required',
            })
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            res.status(400).json({
                success: false,
                message: 'Invalid email address',
            })
            return
        }

        const testEmailHtml = testEmailTemplate()

        const success = await sendEmail({
            to: email,
            subject: `Test Email from ${env.APP_NAME}`,
            html: testEmailHtml,
        })

        if (success) {
            logger.success(`Test email sent to ${email}`)
            res.json({
                success: true,
                message: 'Test email sent successfully',
            })
        } else {
            res.status(500).json({
                success: false,
                message:
                    'Failed to send test email. Please check your SMTP configuration.',
            })
        }
    } catch (error) {
        logger.error(`Error sending test email - ${error}`)
        res.status(500).json({
            success: false,
            message: 'An error occurred while sending the test email',
        })
    }
}
