'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import LoadingScreen from '@/components/loading-screen'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!isLoading && user) {
            if (pathname !== '/auth/verify-email') {
                router.replace('/client')
            }
        }
    }, [user, isLoading, router, pathname])

    if (isLoading) {
        return <LoadingScreen message="Loading..." />
    }

    if (user && pathname !== '/auth/verify-email') {
        return <LoadingScreen message="Redirecting..." />
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 pt-8 md:pt-0">
            {children}
        </div>
    )
}
