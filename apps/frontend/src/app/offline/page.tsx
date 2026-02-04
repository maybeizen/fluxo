'use client'

import React from 'react'
import Button from '@/components/ui/button'

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <div className="w-full max-w-2xl text-center">
                <div className="mb-8">
                    <div className="relative mb-6 inline-flex h-32 w-32 items-center justify-center rounded-full border-2 border-zinc-800 bg-zinc-900">
                        <i className="fas fa-wifi-slash text-6xl text-zinc-600"></i>
                        <div className="bg-primary-400 absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full"></div>
                    </div>
                    <h1 className="mb-4 text-5xl font-bold text-white">
                        No Internet Connection
                    </h1>
                    <p className="mx-auto mb-8 max-w-md text-lg text-zinc-400">
                        It looks like you&apos;re offline. Check your internet
                        connection and try again.
                    </p>
                </div>

                <div className="mx-auto mb-8 max-w-lg rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                    <h3 className="mb-4 font-semibold text-white">
                        Troubleshooting Steps:
                    </h3>
                    <ul className="space-y-3 text-left text-sm text-zinc-400">
                        <li className="flex items-start gap-3">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                                1
                            </div>
                            <span>
                                Check if your WiFi or mobile data is turned on
                            </span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                                2
                            </div>
                            <span>Try turning airplane mode on and off</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                                3
                            </div>
                            <span>Restart your router or modem</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                                4
                            </div>
                            <span>
                                Check if other devices can connect to the
                                internet
                            </span>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        variant="primary"
                        icon="fas fa-redo"
                        iconPosition="left"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                    <Button
                        variant="secondary"
                        icon="fas fa-home"
                        iconPosition="left"
                        onClick={() => (window.location.href = '/')}
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
