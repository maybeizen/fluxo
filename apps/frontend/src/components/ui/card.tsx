import React from 'react'

interface CardProps {
    children: React.ReactNode
    className?: string
    padding?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'default' | 'elevated' | 'outlined'
}

const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
}

const variantClasses = {
    default: 'border border-border bg-surface',
    elevated: 'border border-border bg-surface/80 shadow-lg',
    outlined: 'border-2 border-border bg-transparent',
}

export default function Card({
    children,
    className = '',
    padding = 'md',
    variant = 'default',
}: CardProps) {
    return (
        <div
            className={`rounded-lg ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
        >
            {children}
        </div>
    )
}
