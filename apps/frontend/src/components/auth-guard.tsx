'use client'

import { useAuth } from '@/context/auth-context'
import { useAppSettings } from '@/context/app-settings-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import LoadingScreen from '@/components/loading-screen'
import { UserRole } from '@fluxo/types'

interface AuthGuardProps {
    children: React.ReactNode
    requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
    const { user, isLoading } = useAuth()
    const { maintenanceMode, isLoading: settingsLoading } = useAppSettings()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (isLoading || settingsLoading) {
            return
        }

        if (!user) {
            router.replace('/auth/login')
            return
        }

        if (user.punishment?.isBanned) {
            router.replace('/banned')
            return
        }

        if (
            maintenanceMode &&
            user.role !== UserRole.ADMIN &&
            pathname !== '/maintenance'
        ) {
            router.replace('/maintenance')
            return
        }

        if (
            requireAdmin &&
            user.role !== UserRole.ADMIN &&
            user.role !== UserRole.STAFF
        ) {
            router.replace('/unauthorized')
            return
        }

        if (!requireAdmin && !user.isVerified) {
            const from = encodeURIComponent(window.location.pathname)
            router.replace(
                `/auth/verify-email?email=${encodeURIComponent(user.email)}&from=${from}`
            )
            return
        }
    }, [
        user,
        isLoading,
        settingsLoading,
        maintenanceMode,
        router,
        requireAdmin,
        pathname,
    ])

    let message = 'Verifying access...'
    if (!isLoading && !settingsLoading) {
        if (!user) {
            message = 'Redirecting to login...'
        } else if (user.punishment?.isBanned) {
            message = 'Redirecting...'
        } else if (
            maintenanceMode &&
            user.role !== UserRole.ADMIN &&
            pathname !== '/maintenance'
        ) {
            message = 'Redirecting to maintenance page...'
        } else if (
            requireAdmin &&
            user.role !== UserRole.ADMIN &&
            user.role !== UserRole.STAFF
        ) {
            message = 'Verifying admin privileges...'
        } else if (!requireAdmin && !user.isVerified) {
            message = 'Redirecting to verification...'
        }
    }

    if (
        isLoading ||
        settingsLoading ||
        !user ||
        user.punishment?.isBanned ||
        (maintenanceMode &&
            user.role !== UserRole.ADMIN &&
            pathname !== '/maintenance') ||
        (requireAdmin &&
            user.role !== UserRole.ADMIN &&
            user.role !== UserRole.STAFF) ||
        (!requireAdmin && !user.isVerified)
    ) {
        return <LoadingScreen message={message} />
    }

    return <>{children}</>
}
