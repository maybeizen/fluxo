'use client'

import React from 'react'
import Button from '@/components/ui/button'
import { useAppSettings } from '@/context/app-settings-context'

export default function MaintenancePage() {
    const { maintenanceMessage, isLoading } = useAppSettings()

    const defaultMessage =
        "We're currently performing scheduled maintenance to improve your experience. Thank you for your patience."

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="w-full max-w-2xl text-center">
                <div className="mb-8">
                    <div className="relative mb-6 inline-flex h-32 w-32 items-center justify-center rounded-full border-2 border-blue-900/50 bg-blue-950/30">
                        <i className="fas fa-tools animate-pulse text-6xl text-blue-600"></i>
                    </div>
                    <h1 className="mb-4 text-5xl font-bold text-white">
                        Under Maintenance
                    </h1>
                    <h2 className="mb-4 text-2xl font-semibold text-blue-400">
                        We&apos;ll be back shortly!
                    </h2>
                    <p className="mx-auto mb-8 max-w-md text-lg text-zinc-400">
                        {isLoading
                            ? defaultMessage
                            : maintenanceMessage || defaultMessage}
                    </p>
                </div>

                <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        variant="primary"
                        icon="fas fa-redo"
                        iconPosition="left"
                        onClick={() => window.location.reload()}
                    >
                        Check Status
                    </Button>
                </div>
            </div>
        </div>
    )
}
