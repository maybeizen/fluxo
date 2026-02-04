'use client'

import React from 'react'

interface PageHeaderProps {
    title: string
    description?: string
    action?: React.ReactNode
}

export default function PageHeader({
    title,
    description,
    action,
}: PageHeaderProps) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-white">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-zinc-400">{description}</p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </div>
    )
}
