import React from 'react'

interface SectionHeaderProps {
    title: string
    description?: string
    className?: string
    actions?: React.ReactNode
}

export default function SectionHeader({
    title,
    description,
    className = '',
    actions,
}: SectionHeaderProps) {
    return (
        <div className={`mb-6 border-b border-zinc-900 pb-4 ${className}`}>
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 text-sm text-zinc-400">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2">{actions}</div>
                )}
            </div>
        </div>
    )
}
