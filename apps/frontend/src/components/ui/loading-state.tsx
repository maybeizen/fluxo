import React from 'react'
import Spinner from './spinner'

interface LoadingStateProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    className?: string
    message?: string
}

const sizeMap = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
    xl: 'xl' as const,
}

export default function LoadingState({
    size = 'md',
    className = '',
    message,
}: LoadingStateProps) {
    const paddingClass =
        size === 'xl' ? 'py-20' : size === 'lg' ? 'py-16' : 'py-12'

    return (
        <div
            className={`flex flex-col items-center justify-center ${paddingClass} ${className}`}
        >
            <Spinner size={sizeMap[size]} />
            {message && <p className="mt-4 text-sm text-zinc-400">{message}</p>}
        </div>
    )
}
