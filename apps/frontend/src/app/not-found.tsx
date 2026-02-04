'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ErrorPage from '@/components/ui/error-page'

export default function NotFound() {
    const router = useRouter()

    return (
        <ErrorPage
            statusCode={404}
            title="Page Not Found"
            description="The page you're looking for doesn't exist or has been moved. Let's get you back on track."
            icon="fas fa-question-circle"
            iconVariant="info"
            helpLinks={[
                {
                    label: 'Documentation',
                    icon: 'fas fa-book',
                    onClick: () => router.push('/docs'),
                },
                {
                    label: 'Support',
                    icon: 'fab fa-discord',
                    onClick: () =>
                        window.open('https://discord.gg/yourserver', '_blank'),
                },
            ]}
        />
    )
}
