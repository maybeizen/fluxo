'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ErrorPage from '@/components/ui/error-page'

export default function Error({
    error,
    reset,
}: {
    error: Error
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        console.error('Application error:', error)
    }, [error])

    return (
        <ErrorPage
            statusCode={500}
            title="Something Went Wrong"
            description="We encountered an unexpected error. Don't worry, our team has been notified and is working on a fix."
            icon="fas fa-exclamation-triangle"
            iconVariant="error"
            errorMessage={error.message}
            actions={[
                {
                    label: 'Try Again',
                    icon: 'fas fa-redo',
                    iconPosition: 'left',
                    onClick: () => reset(),
                    variant: 'primary',
                },
                {
                    label: 'Go to Dashboard',
                    icon: 'fas fa-home',
                    iconPosition: 'left',
                    onClick: () => router.push('/client'),
                    variant: 'secondary',
                },
            ]}
            helpLinks={[
                {
                    label: 'Contact Support',
                    icon: 'fas fa-life-ring',
                    onClick: () => router.push('/support'),
                },
                {
                    label: 'Discord',
                    icon: 'fab fa-discord',
                    onClick: () =>
                        window.open('https://discord.gg/NdRseZYNzk', '_blank'),
                },
            ]}
        />
    )
}
