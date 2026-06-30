'use client'

import React from 'react'
import Card from '@/components/ui/card'
import Spinner from '@/components/ui/spinner'
import EmptyState from '@/components/ui/empty-state'

interface PanelCardProps {
    children: React.ReactNode
    title?: string
    description?: string
    actions?: React.ReactNode
    isLoading?: boolean
    empty?: {
        icon?: string
        title: string
        description?: string
    }
    className?: string
    padding?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'default' | 'elevated' | 'outlined'
    overflow?: boolean
}

export default function PanelCard({
    children,
    title,
    description,
    actions,
    isLoading = false,
    empty,
    className = '',
    padding = 'md',
    variant = 'default',
    overflow = true,
}: PanelCardProps) {
    const wrapperClass = overflow ? 'overflow-hidden' : ''

    return (
        <div className={`${wrapperClass} ${className}`}>
            <Card padding={padding} variant={variant}>
                {(title || actions) && (
                    <div className="border-border mb-4 flex items-start justify-between gap-4 border-b pb-4">
                        <div>
                            {title && (
                                <h2 className="text-foreground text-xl font-semibold">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-muted mt-1 text-sm">
                                    {description}
                                </p>
                            )}
                        </div>
                        {actions}
                    </div>
                )}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Spinner size="lg" />
                    </div>
                ) : empty ? (
                    <EmptyState
                        icon={empty.icon ?? 'fas fa-inbox'}
                        title={empty.title}
                        description={empty.description ?? ''}
                    />
                ) : (
                    children
                )}
            </Card>
        </div>
    )
}
