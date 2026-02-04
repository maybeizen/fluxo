import React from 'react'
import Button from './button'

interface EmptyStateProps {
    icon: string
    title: string
    description: string
    action?: {
        label: string
        onClick: () => void
        icon?: string
    }
    className?: string
    iconSize?: 'sm' | 'md' | 'lg'
}

const iconSizeClasses = {
    sm: 'h-16 w-16 text-2xl',
    md: 'h-20 w-20 text-3xl',
    lg: 'h-24 w-24 text-4xl',
}

export default function EmptyState({
    icon,
    title,
    description,
    action,
    className = '',
    iconSize = 'md',
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center py-16 text-center ${className}`}
        >
            <div
                className={`mb-4 flex ${iconSizeClasses[iconSize]} items-center justify-center rounded-full bg-zinc-900`}
            >
                <i className={`${icon} text-zinc-600`}></i>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
            <p className="mb-8 max-w-md text-sm text-zinc-400">{description}</p>
            {action && (
                <Button
                    variant="primary"
                    icon={action.icon}
                    iconPosition="left"
                    onClick={action.onClick}
                >
                    {action.label}
                </Button>
            )}
        </div>
    )
}
