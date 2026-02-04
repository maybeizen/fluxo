import { readFileSync } from 'fs'
import { join } from 'path'
import { env } from './env'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const templateCache = new Map<string, string>()

const loadTemplate = (templateName: string): string => {
    if (templateCache.has(templateName)) {
        return templateCache.get(templateName) || ''
    }

    const templatePath = join(
        __dirname,
        '../src/templates',
        `${templateName}.html`
    )
    const template = readFileSync(templatePath, 'utf-8')
    templateCache.set(templateName, template)
    return template
}

const replaceVariables = (
    template: string,
    variables: Record<string, string>
): string => {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        result = result.replace(regex, value)
    }
    return result
}

const hasImages = (content: string): boolean => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    return imageRegex.test(content)
}

const removeImagesFromContent = (content: string): string => {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    return content.replace(imageRegex, '').trim()
}

export const emailVerificationTemplate = (
    username: string,
    verificationLink: string
): string => {
    const template = loadTemplate('email-verification')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USERNAME: username,
        VERIFICATION_LINK: verificationLink,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const welcomeEmailTemplate = (username: string): string => {
    const template = loadTemplate('welcome-email')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USERNAME: username,
        DASHBOARD_URL: `${env.FRONTEND_URL}/client`,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const renewalReminderTemplate = (
    userName: string,
    serviceName: string,
    daysUntilDue: number,
    dueDate: string,
    amount: string,
    serviceUrl: string
): string => {
    const template = loadTemplate('renewal-reminder')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USER_NAME: userName,
        SERVICE_NAME: serviceName,
        DAYS_UNTIL_DUE: `${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
        DUE_DATE: dueDate,
        AMOUNT: amount,
        SERVICE_URL: serviceUrl,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const invoiceTemplate = (
    userName: string,
    serviceName: string,
    invoiceDate: string,
    dueDate: string,
    amount: string,
    serviceUrl: string
): string => {
    const template = loadTemplate('invoice')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USER_NAME: userName,
        SERVICE_NAME: serviceName,
        INVOICE_DATE: invoiceDate,
        DUE_DATE: dueDate,
        AMOUNT: amount,
        SERVICE_URL: serviceUrl,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const serviceSuspendedTemplate = (
    userName: string,
    serviceName: string,
    amount: string,
    serviceUrl: string
): string => {
    const template = loadTemplate('service-suspended')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USER_NAME: userName,
        SERVICE_NAME: serviceName,
        AMOUNT: amount,
        SERVICE_URL: serviceUrl,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const testEmailTemplate = (): string => {
    const template = loadTemplate('test-email')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        SMTP_HOST: env.SMTP_HOST || 'not-configured',
        SMTP_PORT: env.SMTP_PORT?.toString() || 'not-configured',
        EMAIL_FROM: env.EMAIL_FROM || 'not-configured',
        YEAR: new Date().getFullYear().toString(),
    })
}

export const ticketCreatedTemplate = (
    username: string,
    ticketId: string,
    ticketTitle: string,
    ticketContent: string,
    ticketType: string,
    ticketUrl: string
): string => {
    const template = loadTemplate('ticket-created')
    const containsImages = hasImages(ticketContent)
    const textContent = removeImagesFromContent(ticketContent.trim())

    const imagesNotice = containsImages
        ? `<div style="margin: 16px 0; padding: 12px; background-color: #292524; border: 1px solid #2d2a28; border-radius: 4px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #a8a29e;">
          <i style="margin-right: 6px;">📎</i>This message contains images. Please visit your dashboard to view them.
        </p>
      </div>`
        : ''

    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USERNAME: username,
        TICKET_ID: ticketId,
        TICKET_TITLE: ticketTitle,
        TICKET_CONTENT: textContent || ticketContent.trim(),
        TICKET_IMAGES: imagesNotice,
        TICKET_TYPE: ticketType.charAt(0).toUpperCase() + ticketType.slice(1),
        TICKET_URL: ticketUrl,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const ticketRespondedTemplate = (
    username: string,
    ticketId: string,
    ticketTitle: string,
    messageContent: string,
    responderName: string,
    ticketUrl: string
): string => {
    const template = loadTemplate('ticket-responded')
    const normalizedContent = messageContent.trim()
    const containsImages = hasImages(normalizedContent)
    const textContent = removeImagesFromContent(normalizedContent)

    const imagesNotice = containsImages
        ? `<div style="margin: 16px 0; padding: 12px; background-color: #292524; border: 1px solid #2d2a28; border-radius: 4px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #a8a29e;">
          <i style="margin-right: 6px;">📎</i>This message contains images. Please visit your dashboard to view them.
        </p>
      </div>`
        : ''

    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USERNAME: username,
        TICKET_ID: ticketId,
        TICKET_TITLE: ticketTitle,
        MESSAGE_CONTENT: textContent || normalizedContent,
        MESSAGE_IMAGES: imagesNotice,
        RESPONDER_NAME: responderName,
        TICKET_URL: ticketUrl,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const ticketClosedTemplate = (
    username: string,
    ticketId: string,
    ticketTitle: string,
    closedDate: string,
    ticketUrl: string,
    newTicketUrl: string
): string => {
    const template = loadTemplate('ticket-closed')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USERNAME: username,
        TICKET_ID: ticketId,
        TICKET_TITLE: ticketTitle,
        CLOSED_DATE: closedDate,
        TICKET_URL: ticketUrl,
        NEW_TICKET_URL: newTicketUrl,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const invoiceReminderTemplate = (
    userName: string,
    invoiceNumber: string,
    daysUntilDue: number,
    dueDate: string,
    amount: string,
    invoiceUrl: string
): string => {
    const template = loadTemplate('invoice-reminder')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USER_NAME: userName,
        INVOICE_NUMBER: invoiceNumber,
        DAYS_UNTIL_DUE: `${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
        DUE_DATE: dueDate,
        AMOUNT: amount,
        INVOICE_URL: invoiceUrl,
        YEAR: new Date().getFullYear().toString(),
    })
}

export const servicePaymentWarningTemplate = (
    userName: string,
    serviceName: string,
    daysOverdue: number,
    daysUntilSuspension: number,
    dueDate: string,
    amount: string,
    serviceUrl: string
): string => {
    const template = loadTemplate('service-payment-warning')
    return replaceVariables(template, {
        APP_NAME: env.APP_NAME,
        USER_NAME: userName,
        SERVICE_NAME: serviceName,
        DAYS_OVERDUE: daysOverdue.toString(),
        DAYS_OVERDUE_PLURAL: daysOverdue > 1 ? 's' : '',
        DAYS_UNTIL_SUSPENSION: daysUntilSuspension.toString(),
        DAYS_UNTIL_SUSPENSION_PLURAL: daysUntilSuspension > 1 ? 's' : '',
        DUE_DATE: dueDate,
        AMOUNT: amount,
        SERVICE_URL: serviceUrl,
        YEAR: new Date().getFullYear().toString(),
    })
}
