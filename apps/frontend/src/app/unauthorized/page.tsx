'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import ErrorPage from '@/components/ui/error-page'

export default function UnauthorizedPage() {
    const router = useRouter()

    return (
        <ErrorPage
            statusCode={403}
            title="Access Denied"
            description="You don't have permission to access this page. If you believe this is an error, please contact support."
            icon="fas fa-lock"
            iconVariant="warning"
            helpLinks={[
                {
                    label: 'Contact Support',
                    icon: 'fas fa-life-ring',
                    onClick: () => router.push('/support'),
                },
            ]}
        >
            <div className="mx-auto mt-6 max-w-lg rounded-lg border border-zinc-900 bg-zinc-950 p-6 text-left">
                <p className="mb-4 text-sm font-semibold text-zinc-300">
                    Why am I seeing this?
                </p>
                <ul className="space-y-2 text-sm text-zinc-400">
                    <li className="flex items-start gap-2">
                        <i className="fas fa-circle mt-1.5 text-xs text-zinc-600"></i>
                        <span>You may not have the required permissions</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <i className="fas fa-circle mt-1.5 text-xs text-zinc-600"></i>
                        <span>Your session may have expired</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <i className="fas fa-circle mt-1.5 text-xs text-zinc-600"></i>
                        <span>
                            This resource may be restricted to administrators
                        </span>
                    </li>
                </ul>
            </div>
        </ErrorPage>
    )
}
