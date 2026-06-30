'use client'

import React from 'react'
import Spinner from '@/components/ui/spinner'

interface PageShellProps {
    title: string
    description?: React.ReactNode
    actions?: React.ReactNode
    filters?: React.ReactNode
    children: React.ReactNode
    maxWidth?: '4xl' | '5xl' | '6xl' | '7xl'
    className?: string
}

const maxWidthClasses = {
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
}

export default function PageShell({
    title,
    description,
    actions,
    filters,
    children,
    maxWidth = '7xl',
    className = '',
}: PageShellProps) {
    return (
        <div
            className={`bg-background min-h-screen px-4 pt-12 lg:px-8 ${className}`}
        >
            <div className={`mx-auto ${maxWidthClasses[maxWidth]}`}>
                <header className="mb-8">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-foreground mb-2 text-3xl font-bold">
                                {title}
                            </h1>
                            {description && (
                                <p className="text-muted">{description}</p>
                            )}
                        </div>
                        {actions && (
                            <div className="flex shrink-0 items-center gap-3">
                                {actions}
                            </div>
                        )}
                    </div>
                    {filters}
                </header>
                {children}
            </div>
        </div>
    )
}

interface PageLoadingProps {
    label?: string
}

export function PageLoading({ label }: PageLoadingProps) {
    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner size="lg" />
            {label && (
                <span className="sr-only" role="status">
                    {label}
                </span>
            )}
        </div>
    )
}
