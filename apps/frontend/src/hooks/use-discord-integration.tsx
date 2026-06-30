'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNotifications } from '@/context/notification-context'
import { useAuth } from '@/context/auth-context'
import { initiateDiscordConnection, disconnectDiscord } from '@/lib/discord'

export function useDiscordIntegration() {
    const router = useRouter()
    const notifications = useNotifications()
    const { refreshAuth } = useAuth()
    const [isDisconnecting, setIsDisconnecting] = useState(false)

    const handleConnect = async () => {
        try {
            const authUrl = await initiateDiscordConnection()
            router.push(authUrl)
        } catch (error: unknown) {
            const errorMessage =
                error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined
            notifications.error(
                errorMessage || 'Failed to initiate Discord connection'
            )
        }
    }

    const handleDisconnect = async () => {
        try {
            setIsDisconnecting(true)
            await disconnectDiscord()
            await refreshAuth()
            notifications.success('Discord account disconnected successfully')
        } catch (error: unknown) {
            const errorMessage =
                error && typeof error === 'object' && 'response' in error
                    ? (error.response as { data?: { message?: string } })?.data
                          ?.message
                    : undefined
            notifications.error(
                errorMessage || 'Failed to disconnect Discord account'
            )
        } finally {
            setIsDisconnecting(false)
        }
    }

    return {
        isDisconnecting,
        handleConnect,
        handleDisconnect,
    }
}
