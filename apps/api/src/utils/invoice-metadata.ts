export function parseInvoiceMetadata(
    metadata: unknown
): Record<string, unknown> | null {
    if (metadata == null) return null
    if (typeof metadata === 'object' && !Array.isArray(metadata)) {
        return metadata as Record<string, unknown>
    }
    if (typeof metadata === 'string') {
        if (metadata === '') return null
        try {
            return JSON.parse(metadata) as Record<string, unknown>
        } catch {
            return null
        }
    }
    return null
}

export function serializeInvoiceMetadata(
    metadata: Record<string, unknown> | null | undefined
): Record<string, unknown> | null {
    if (!metadata || Object.keys(metadata).length === 0) return null
    return metadata
}
