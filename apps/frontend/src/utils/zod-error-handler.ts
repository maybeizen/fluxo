import { ZodError } from 'zod'

interface NotificationOptions {
    duration?: number
}

interface NotificationMethods {
    error: (message: string, options?: NotificationOptions) => string
}

export const handleZodErrors = (
    error: unknown,
    notifications: NotificationMethods
): boolean => {
    if (!(error instanceof ZodError)) {
        return false
    }

    const errorsByField = new Map<string, string>()

    error.issues.forEach((issue) => {
        const fieldKey = issue.path.length > 0 ? issue.path.join('.') : 'form'

        if (!errorsByField.has(fieldKey)) {
            errorsByField.set(fieldKey, issue.message)
        }
    })

    errorsByField.forEach((message) => {
        notifications.error(message, {
            duration: 5000,
        })
    })

    return true
}

export const formatZodError = (
    path: (string | number)[],
    message: string
): string => {
    if (path.length === 0) {
        return message
    }

    const fieldName = path
        .map((segment) => {
            if (typeof segment === 'string') {
                return segment.charAt(0).toUpperCase() + segment.slice(1)
            }
            return segment
        })
        .join(' → ')

    return `${fieldName}: ${message}`
}

export const handleZodErrorsLimited = (
    error: unknown,
    notifications: NotificationMethods,
    maxErrors?: number
): boolean => {
    if (!(error instanceof ZodError)) {
        return false
    }

    const issues = maxErrors ? error.issues.slice(0, maxErrors) : error.issues

    issues.forEach((issue) => {
        const message = formatZodError(
            issue.path as (string | number)[],
            issue.message
        )
        notifications.error(message, {
            duration: 5000,
        })
    })

    if (maxErrors && error.issues.length > maxErrors) {
        notifications.error(
            `And ${error.issues.length - maxErrors} more validation errors...`,
            {
                duration: 5000,
            }
        )
    }

    return true
}
