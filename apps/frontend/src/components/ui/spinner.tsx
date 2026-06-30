import React from 'react'

interface SpinnerProps {
    size?: 'sm' | 'base' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
    className?: string
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
    const sizeClass =
        {
            sm: 'text-sm',
            base: 'text-base',
            md: 'text-lg',
            lg: 'text-xl',
            xl: 'text-2xl',
            '2xl': 'text-3xl',
            '3xl': 'text-4xl',
            '4xl': 'text-5xl',
            '5xl': 'text-6xl',
        }[size] || 'text-lg'

    return (
        <span
            className={`inline-flex items-center justify-center text-white ${sizeClass} ${className}`}
            role="status"
            aria-label="Loading"
        >
            <i
                className={`fas fa-spinner-third animate-spin ${sizeClass}`}
                aria-hidden="true"
            ></i>
        </span>
    )
}
