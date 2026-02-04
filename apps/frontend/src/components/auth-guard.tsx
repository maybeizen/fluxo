'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import LoadingScreen from '@/components/loading-screen'
import { UserRole } from '@fluxo/types'

interface AuthGuardProps {
    children: React.ReactNode
    requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) {
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
    }, [user, isLoading, router, requireAdmin])

    let message = 'Verifying access...'
    if (!isLoading) {
        if (!user) {
            message = 'Redirecting to login...'
        } else if (user.punishment?.isBanned) {
            message = 'Redirecting...'
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
        !user ||
        user.punishment?.isBanned ||
        (requireAdmin &&
            user.role !== UserRole.ADMIN &&
            user.role !== UserRole.STAFF) ||
        (!requireAdmin && !user.isVerified)
    ) {
        return <LoadingScreen message={message} />
    }

    return <>{children}</>
}
