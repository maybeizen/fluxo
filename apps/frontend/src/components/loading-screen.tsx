import React from 'react'
import Spinner from './ui/spinner'

interface LoadingScreenProps {
    message?: string
    subtitle?: string
    showTitle?: boolean
}

export default function LoadingScreen({
    message = 'Verifying access...',
    subtitle,
    showTitle = true,
}: LoadingScreenProps) {
    return (
        <main className="relative flex min-h-screen items-center justify-center bg-black">
            <section className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 px-8 py-10 text-center shadow-lg backdrop-blur-md">
                <div className="mb-8 flex flex-col items-center">
                    {showTitle && (
                        <h1 className="mb-5 text-3xl font-semibold tracking-tight text-white">
                            Fluxo
                        </h1>
                    )}
                    <div className="flex flex-col items-center gap-4">
                        <Spinner size="lg" />
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-white">
                                {message}
                            </span>
                            {subtitle && (
                                <span className="text-xs text-zinc-400">
                                    {subtitle}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
