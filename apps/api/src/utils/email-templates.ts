import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { env } from './env'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const templateCache = new Map<string, string>()
const DEFAULT_THEME_COLOR = '#ffd952'

let cachedThemeColor: string | null = null

/** Host may call this after loading settings to apply admin theme color to emails. */
export function setEmailThemeColor(color: string): void {
    cachedThemeColor = color
}

function getThemeColor(): string {
    return (
        cachedThemeColor ?? process.env.APP_THEME_COLOR ?? DEFAULT_THEME_COLOR
    )
}

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

const ctaStyle = (themeColor: string): string => {
    const path = join(__dirname, '../src/templates', '_cta-style.txt')
    return readFileSync(path, 'utf-8')
        .trim()
        .replace(/\{\{THEME_COLOR\}\}/g, themeColor)
}

const composeEmail = (
    title: string,
    contentTemplate: string,
    variables: Record<string, string>,
    footer: string
): string => {
    const themeColor = getThemeColor()
    const base = loadTemplate('_base')
    const content = replaceVariables(contentTemplate, {
        ...variables,
        THEME_COLOR: themeColor,
        CTA_STYLE: ctaStyle(themeColor),
        APP_NAME: env.APP_NAME,
    })

    return replaceVariables(base, {
        TITLE: title,
        CONTENT: content,
        FOOTER: footer,
        APP_NAME: env.APP_NAME,
        YEAR: new Date().getFullYear().toString(),
        THEME_COLOR: themeColor,
        ...variables,
    })
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
    const content = loadTemplate('email-verification')
    return composeEmail(
        'Verify Your Email',
        content,
        { USERNAME: username, VERIFICATION_LINK: verificationLink },
        "If you didn't create an account, you can safely ignore this email."
    )
}

export const welcomeEmailTemplate = (username: string): string => {
    const content = loadTemplate('welcome-email')
    return composeEmail(
        `Welcome to ${env.APP_NAME}`,
        content,
        { USERNAME: username, DASHBOARD_URL: `${env.FRONTEND_URL}/client` },
        'If you have any questions, feel free to contact our support team.'
    )
}

export const renewalReminderTemplate = (
    userName: string,
    serviceName: string,
    daysUntilDue: number,
    dueDate: string,
    amount: string,
    serviceUrl: string
): string => {
    const content = loadTemplate('renewal-reminder')
    return composeEmail(
        'Renewal Reminder',
        content,
        {
            USER_NAME: userName,
            SERVICE_NAME: serviceName,
            DAYS_UNTIL_DUE: `${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
            DUE_DATE: dueDate,
            AMOUNT: amount,
            SERVICE_URL: serviceUrl,
        },
        'Manage your services from your dashboard.'
    )
}

export const invoiceTemplate = (
    userName: string,
    serviceName: string,
    invoiceDate: string,
    dueDate: string,
    amount: string,
    serviceUrl: string
): string => {
    const content = loadTemplate('invoice')
    return composeEmail(
        'New Invoice',
        content,
        {
            USER_NAME: userName,
            SERVICE_NAME: serviceName,
            INVOICE_DATE: invoiceDate,
            DUE_DATE: dueDate,
            AMOUNT: amount,
            SERVICE_URL: serviceUrl,
        },
        'Pay invoices from your client dashboard.'
    )
}

export const serviceSuspendedTemplate = (
    userName: string,
    serviceName: string,
    amount: string,
    serviceUrl: string
): string => {
    const content = loadTemplate('service-suspended')
    return composeEmail(
        'Service Suspended',
        content,
        {
            USER_NAME: userName,
            SERVICE_NAME: serviceName,
            AMOUNT: amount,
            SERVICE_URL: serviceUrl,
        },
        'Contact support if you need assistance.'
    )
}

export const testEmailTemplate = (): string => {
    const content = loadTemplate('test-email')
    return composeEmail(
        'Test Email',
        content,
        {
            SMTP_HOST: env.SMTP_HOST || 'not-configured',
            SMTP_PORT: env.SMTP_PORT?.toString() || 'not-configured',
            EMAIL_FROM: env.EMAIL_FROM || 'not-configured',
        },
        'This is a test message from your Fluxo installation.'
    )
}

export const ticketCreatedTemplate = (
    username: string,
    ticketId: string,
    ticketTitle: string,
    ticketContent: string,
    ticketType: string,
    ticketUrl: string
): string => {
    const content = loadTemplate('ticket-created')
    const containsImages = hasImages(ticketContent)
    const textContent = removeImagesFromContent(ticketContent.trim())
    const imagesNotice = containsImages
        ? `<div style="margin: 16px 0; padding: 12px; background-color: #292524; border: 1px solid #2d2a28; border-radius: 4px; text-align: center;"><p style="margin: 0; font-size: 13px; color: #a8a29e;">This message contains images. Please visit your dashboard to view them.</p></div>`
        : ''

    return composeEmail(
        'Ticket Created',
        content,
        {
            USERNAME: username,
            TICKET_ID: ticketId,
            TICKET_TITLE: ticketTitle,
            TICKET_CONTENT: textContent || ticketContent.trim(),
            TICKET_IMAGES: imagesNotice,
            TICKET_TYPE:
                ticketType.charAt(0).toUpperCase() + ticketType.slice(1),
            TICKET_URL: ticketUrl,
        },
        'You can reply from your dashboard.'
    )
}

export const ticketRespondedTemplate = (
    username: string,
    ticketId: string,
    ticketTitle: string,
    messageContent: string,
    responderName: string,
    ticketUrl: string
): string => {
    const content = loadTemplate('ticket-responded')
    const normalizedContent = messageContent.trim()
    const containsImages = hasImages(normalizedContent)
    const textContent = removeImagesFromContent(normalizedContent)
    const imagesNotice = containsImages
        ? `<div style="margin: 16px 0; padding: 12px; background-color: #292524; border: 1px solid #2d2a28; border-radius: 4px; text-align: center;"><p style="margin: 0; font-size: 13px; color: #a8a29e;">This message contains images. Please visit your dashboard to view them.</p></div>`
        : ''

    return composeEmail(
        'Ticket Update',
        content,
        {
            USERNAME: username,
            TICKET_ID: ticketId,
            TICKET_TITLE: ticketTitle,
            MESSAGE_CONTENT: textContent || normalizedContent,
            MESSAGE_IMAGES: imagesNotice,
            RESPONDER_NAME: responderName,
            TICKET_URL: ticketUrl,
        },
        'Reply from your dashboard to continue the conversation.'
    )
}

export const ticketClosedTemplate = (
    username: string,
    ticketId: string,
    ticketTitle: string,
    closedDate: string,
    ticketUrl: string,
    newTicketUrl: string
): string => {
    const content = loadTemplate('ticket-closed')
    return composeEmail(
        'Ticket Closed',
        content,
        {
            USERNAME: username,
            TICKET_ID: ticketId,
            TICKET_TITLE: ticketTitle,
            CLOSED_DATE: closedDate,
            TICKET_URL: ticketUrl,
            NEW_TICKET_URL: newTicketUrl,
        },
        'Open a new ticket anytime from your dashboard.'
    )
}

export const invoiceReminderTemplate = (
    userName: string,
    invoiceNumber: string,
    daysUntilDue: number,
    dueDate: string,
    amount: string,
    invoiceUrl: string
): string => {
    const content = loadTemplate('invoice-reminder')
    return composeEmail(
        'Invoice Reminder',
        content,
        {
            USER_NAME: userName,
            INVOICE_NUMBER: invoiceNumber,
            DAYS_UNTIL_DUE: `${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
            DUE_DATE: dueDate,
            AMOUNT: amount,
            INVOICE_URL: invoiceUrl,
        },
        'Pay outstanding invoices from your dashboard.'
    )
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
    const content = loadTemplate('service-payment-warning')
    return composeEmail(
        'Payment Warning',
        content,
        {
            USER_NAME: userName,
            SERVICE_NAME: serviceName,
            DAYS_OVERDUE: daysOverdue.toString(),
            DAYS_OVERDUE_PLURAL: daysOverdue > 1 ? 's' : '',
            DAYS_UNTIL_SUSPENSION: daysUntilSuspension.toString(),
            DAYS_UNTIL_SUSPENSION_PLURAL: daysUntilSuspension > 1 ? 's' : '',
            DUE_DATE: dueDate,
            AMOUNT: amount,
            SERVICE_URL: serviceUrl,
        },
        'Pay promptly to avoid service suspension.'
    )
}
