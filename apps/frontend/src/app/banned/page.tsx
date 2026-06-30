'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import LoadingScreen from '@/components/loading-screen'

export default function BannedPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && user && !user.punishment?.isBanned) {
            router.replace('/client')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <LoadingScreen message="Loading..." />
    }

    if (!user || !user.punishment?.isBanned) {
        return null
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="border-primary-800/50 w-full max-w-2xl rounded-lg border bg-zinc-950 p-8 text-center">
                <div className="mb-6">
                    <div className="border-primary-400/50 bg-primary-400/20 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border">
                        <i className="fas fa-ban text-primary-400 text-4xl"></i>
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        Account Banned
                    </h1>
                    <p className="text-lg text-zinc-400">
                        Your account has been banned from accessing this
                        platform.
                    </p>
                </div>

                {user.punishment.referenceId && (
                    <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                        <p className="mb-1 text-sm text-zinc-400">
                            Reference ID:
                        </p>
                        <p className="font-mono text-sm break-all text-white">
                            {user.punishment.referenceId}
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="text-zinc-400">
                        If you believe this is an error, please contact support
                        with your reference ID.
                    </p>
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/auth/login')}
                    >
                        Return to Login
                    </Button>
                </div>
            </div>
        </div>
    )
}
