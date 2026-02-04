'use client'

import React from 'react'
import { PterodactylSettings } from '@fluxo/types'
import Button from '@/components/ui/button'
import { testPterodactylCredentials } from '@/lib/admin/pterodactyl'

interface OverviewTabProps {
    settings: PterodactylSettings | null
    isTesting: boolean
    onTestCredentials: () => void
    onNavigateToSettings: () => void
}

export default function OverviewTab({
    settings,
    isTesting,
    onTestCredentials,
    onNavigateToSettings,
}: OverviewTabProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                    Connection Status
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Base URL</span>
                        <span className="font-mono text-sm text-white">
                            {settings?.baseUrl || 'Not configured'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400">API Key</span>
                        <span className="font-mono text-sm text-white">
                            {settings?.apiKey ? '••••••••' : 'Not configured'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Status</span>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                                settings?.baseUrl && settings?.apiKey
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-zinc-500/20 text-zinc-400'
                            }`}
                        >
                            {settings?.baseUrl && settings?.apiKey
                                ? 'Configured'
                                : 'Not Configured'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
