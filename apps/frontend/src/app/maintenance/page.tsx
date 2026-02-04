'use client'

import React from 'react'
import Button from '@/components/ui/button'

export default function MaintenancePage() {
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
                        We&apos;re currently performing scheduled maintenance to
                        improve your experience. Thank you for your patience.
                    </p>
                </div>

                <div className="mx-auto mb-8 max-w-lg rounded-lg border border-zinc-900 bg-zinc-950 p-6">
                    <div className="flex items-center justify-center gap-4 text-zinc-400">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-clock text-blue-500"></i>
                            <span className="text-sm">
                                Estimated Time: 30 minutes
                            </span>
                        </div>
                    </div>
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
                    <Button
                        variant="secondary"
                        icon="fab fa-discord"
                        iconPosition="left"
                        onClick={() =>
                            window.open(
                                'https://discord.gg/yourserver',
                                '_blank'
                            )
                        }
                    >
                        Join Discord
                    </Button>
                </div>

                <div className="border-t border-zinc-900 pt-8">
                    <p className="mb-4 text-sm text-zinc-500">
                        What&apos;s happening?
                    </p>
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                            <i className="fas fa-server mb-2 text-2xl text-blue-500"></i>
                            <h3 className="mb-1 text-sm font-semibold text-white">
                                Server Updates
                            </h3>
                            <p className="text-xs text-zinc-500">
                                Updating core infrastructure
                            </p>
                        </div>
                        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                            <i className="fas fa-shield-alt mb-2 text-2xl text-green-500"></i>
                            <h3 className="mb-1 text-sm font-semibold text-white">
                                Security Patches
                            </h3>
                            <p className="text-xs text-zinc-500">
                                Applying latest security fixes
                            </p>
                        </div>
                        <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
                            <i className="fas fa-tachometer-alt mb-2 text-2xl text-purple-500"></i>
                            <h3 className="mb-1 text-sm font-semibold text-white">
                                Performance
                            </h3>
                            <p className="text-xs text-zinc-500">
                                Optimizing for speed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
