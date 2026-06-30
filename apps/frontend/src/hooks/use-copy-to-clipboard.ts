'use client'

import { useCallback, useState } from 'react'
import { useNotifications } from '@/context/notification-context'

interface UseCopyToClipboardOptions {
    successMessage?: string
    errorMessage?: string
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
    const notifications = useNotifications()
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const copy = useCallback(
        async (text: string, label = 'ID') => {
            try {
                await navigator.clipboard.writeText(text)
                setCopiedId(text)
                notifications.success(
                    options.successMessage ?? `${label} copied to clipboard`
                )
                setTimeout(() => setCopiedId(null), 2000)
                return true
            } catch {
                notifications.error(
                    options.errorMessage ??
                        `Failed to copy ${label.toLowerCase()}`
                )
                return false
            }
        },
        [notifications, options.errorMessage, options.successMessage]
    )

    return { copy, copiedId }
}
