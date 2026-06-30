'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useNotifications } from '@/context/notification-context'
import { useAuth } from '@/context/auth-context'

export function useDiscordCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const notifications = useNotifications()
    const { refreshAuth } = useAuth()
    const hasShownNotification = useRef(false)

    useEffect(() => {
        const discordStatus = searchParams.get('discord')
        const error = searchParams.get('error')

        if (
            (discordStatus === 'connected' || error) &&
            !hasShownNotification.current
        ) {
            hasShownNotification.current = true

            if (discordStatus === 'connected') {
                notifications.success('Discord account connected successfully')
                refreshAuth()
            } else if (error) {
                const errorMessages: Record<string, string> = {
                    user_not_found: 'User not found',
                    invalid_callback: 'Invalid Discord callback',
                    connection_failed: 'Failed to connect Discord account',
                }
                notifications.error(errorMessages[error] || 'An error occurred')
            }

            router.replace('/client')
        }
    }, [searchParams, refreshAuth, router])
}
