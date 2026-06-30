const SCRIPT_TAG_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const EVENT_HANDLER_RE = /\s(on\w+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi
const JAVASCRIPT_URL_RE = /javascript\s*:/gi

/**
 * Strip dangerous HTML patterns from user-generated content before storage.
 */
export function sanitizeText(input: string): string {
    return input
        .replace(SCRIPT_TAG_RE, '')
        .replace(EVENT_HANDLER_RE, '')
        .replace(JAVASCRIPT_URL_RE, '')
        .trim()
}

/**
 * Sanitize optional text fields; returns undefined for empty results.
 */
export function sanitizeOptionalText(
    input: string | null | undefined
): string | undefined {
    if (input == null || input === '') return undefined
    const sanitized = sanitizeText(input)
    return sanitized.length > 0 ? sanitized : undefined
}

/** Normalize Express route params that may be string | string[]. */
export function paramString(value: string | string[] | undefined): string {
    if (value == null) return ''
    return Array.isArray(value) ? value[0] : value
}
