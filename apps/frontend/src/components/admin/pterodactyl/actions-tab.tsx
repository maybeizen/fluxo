'use client'

import React from 'react'
import { PterodactylSettings } from '@fluxo/types'
import Button from '@/components/ui/button'

interface ActionsTabProps {
    settings: PterodactylSettings | null
}

export default function ActionsTab({ settings }: ActionsTabProps) {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                    Server Actions
                </h2>
                <p className="mb-6 text-zinc-400">
                    Perform bulk operations and manage servers through the
                    Pterodactyl API.
                </p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                <i className="fas fa-server text-blue-400"></i>
                            </div>
                            <h3 className="font-medium text-white">
                                List Servers
                            </h3>
                        </div>
                        <p className="mb-3 text-sm text-zinc-400">
                            View all servers managed by Pterodactyl
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!settings?.baseUrl || !settings?.apiKey}
                            icon="fas fa-arrow-right"
                        >
                            View Servers
                        </Button>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                                <i className="fas fa-users text-green-400"></i>
                            </div>
                            <h3 className="font-medium text-white">
                                List Users
                            </h3>
                        </div>
                        <p className="mb-3 text-sm text-zinc-400">
                            View all users in the Pterodactyl panel
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!settings?.baseUrl || !settings?.apiKey}
                            icon="fas fa-arrow-right"
                        >
                            View Users
                        </Button>
                    </div>

                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                                <i className="fas fa-sync-alt text-purple-400"></i>
                            </div>
                            <h3 className="font-medium text-white">
                                Sync Data
                            </h3>
                        </div>
                        <p className="mb-3 text-sm text-zinc-400">
                            Synchronize data between systems
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={!settings?.baseUrl || !settings?.apiKey}
                            icon="fas fa-arrow-right"
                        >
                            Sync Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
